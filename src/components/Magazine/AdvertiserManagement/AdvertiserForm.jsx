import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, FileText, ArrowLeft, X, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { acceptSelfBillingAgreement, createPlatformCustomer, getAdvertiserStripeStatus } from '../api';
import usePropertySubtypes from '@/hooks/usePropertySubtypes';

// Advertiser Form Component - Updated for week-based system
// isSelfService: When true, hides admin-only fields (commission, week_rate) - used when advertiser edits their own profile
const AdvertiserForm = ({ open, onOpenChange, advertiser, onClose, onSubmit, isLoading, error, isSelfService = false }) => {
  const [showSelfBillingContent, setShowSelfBillingContent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [subtypeSearchTerm, setSubtypeSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();

  // Get property subtypes using the custom hook
  const { subtypeOptions, groupedPropertyTypes } = usePropertySubtypes();

  // Filter subtypes based on search term
  const filteredGroupedPropertyTypes = useMemo(() => {
    const searchLower = subtypeSearchTerm.toLowerCase().trim();
    if (!searchLower) return groupedPropertyTypes;

    return groupedPropertyTypes
      .map(type => ({
        ...type,
        subtypes: type.subtypes.filter(subtype =>
          subtype.label.toLowerCase().includes(searchLower) ||
          type.label.toLowerCase().includes(searchLower)
        )
      }))
      .filter(type => type.subtypes.length > 0);
  }, [groupedPropertyTypes, subtypeSearchTerm]);

  // Parse initial pstids into array for Controller
  const initialPstids = useMemo(() => {
    if (!advertiser?.pstids) return [];
    return advertiser.pstids
      .replace(/^,|,$/g, '')
      .split(',')
      .filter(id => id.trim())
      .map(id => id.trim());
  }, [advertiser?.pstids]);

  const { register, handleSubmit, formState: { errors }, watch, reset, control } = useForm({
    values: advertiser ? {
      ...advertiser,
      pstids: initialPstids,
      email: advertiser.email || '',
      password: '',
      confirmPassword: ''
    } : {
      company: '',
      email: '',
      password: '',
      confirmPassword: '',
      pstids: [],
      week_rate: '',
      vat_registered: false,
      vat_number: '',
      commission_percent: 50
    }
  });

  const advertiserOnboarded = true

  const isVatRegistered = watch('vat_registered');
  const password = watch('password');

  // Fetch advertiser Stripe status
  const {
    data: stripeStatusData,
    isLoading: stripeStatusLoading
  } = useQuery({
    queryKey: ['advertiser-stripe-status', advertiser?.id],
    queryFn: () => getAdvertiserStripeStatus(advertiser?.id),
    enabled: !!advertiser?.id
  });

  const stripeStatus = stripeStatusData?.data;
  const hasStripeAccount = !!stripeStatus?.account_id;
  const hasPlatformCustomer = !!stripeStatus?.platform_customer_id;

  const acceptMutation = useMutation({
    mutationFn: () => acceptSelfBillingAgreement(advertiser?.id),
    onSuccess: () => {
      // Invalidate queries to refresh advertiser data
      queryClient.invalidateQueries({ queryKey: ['advertiser-stripe-status', advertiser?.id] });
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });

      toast({
        title: 'Agreement Accepted',
        description: 'Self-billing agreement has been accepted. You can now activate the subscription.',
      });

      // Reset to main form - the form will automatically show the updated status
      // because the parent component will re-render with fresh data from the invalidated query
      setShowSelfBillingContent(false);
      setAgreed(false);
    },
    onError: (error) => {
      console.error('Failed to accept self-billing agreement:', error);
    }
  });

  const createPlatformCustomerMutation = useMutation({
    mutationFn: () => createPlatformCustomer(advertiser?.id),
    onSuccess: (data) => {
      // Invalidate queries to refresh advertiser data
      queryClient.invalidateQueries({ queryKey: ['advertiser-stripe-status', advertiser?.id] });
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });

      if (data?.data?.already_exists) {
        toast({
          title: 'Already Exists',
          description: 'Platform customer already exists for this advertiser',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Platform customer created successfully',
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create platform customer:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error?.response?.data?.error || 'Failed to create platform customer. Please try again.',
      });
    }
  });

  const handleFormSubmit = (data) => {
    // Validate password match on create
    if (!advertiser && data.password !== data.confirmPassword) {
      return;
    }

    // Format pstids to ensure proper comma-delimited format with leading and trailing commas
    const formattedData = {
      ...data,
      pstids: Array.isArray(data.pstids) && data.pstids.length > 0
        ? `,${data.pstids.join(',')},`
        : '',
      week_rate: parseFloat(data.week_rate),
      commission_percent: parseFloat(data.commission_percent),
      vat_registered: Boolean(data.vat_registered),
      vat_number: data.vat_registered ? data.vat_number : ''
    };

    // Only include email and password if they have values
    if (data.email && data.email.trim()) {
      formattedData.email = data.email.trim();
    } else {
      delete formattedData.email;
    }

    if (data.password && data.password.trim()) {
      formattedData.password = data.password.trim();
    } else {
      delete formattedData.password;
    }

    // Remove confirmPassword from the submitted data
    delete formattedData.confirmPassword;

    onSubmit(formattedData);
  };

  const handleAcceptAgreement = () => {
    if (agreed) {
      acceptMutation.mutate();
    }
  };

  const handleBackToForm = () => {
    setShowSelfBillingContent(false);
    setAgreed(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl flex flex-col">
        {!showSelfBillingContent ? (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle className="flex items-center gap-2">
                {advertiser ? 'Edit Advertiser' : 'Add New Advertiser'}
              </DialogTitle>
              <DialogDescription>
                Required for Platform Merchant of Record (MoR) model
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className='flex-1 space-y-4 overflow-y-auto -mx-6 px-6'>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    {...register('company', { required: 'Company name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                  />
                  {errors.company && (
                    <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                  )}
                </div>

                {/* Account Credentials Section */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Account Credentials</h4>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email Address {!advertiser && '*'}
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        required: !advertiser ? 'Email is required' : false,
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="advertiser@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {advertiser ? 'Update email address (leave as is to keep current)' : 'Used for advertiser login'}
                    </p>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">
                      Password {!advertiser && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: !advertiser ? 'Password is required' : false,
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                          }
                        })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={advertiser ? '••••••••' : 'Enter password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {advertiser ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                    </p>
                  </div>

                  {!advertiser && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword', {
                            required: !advertiser ? 'Please confirm your password' : false,
                            validate: (value) => !advertiser ? (value === password || 'Passwords do not match') : true
                          })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Re-enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Property Subtypes</label>
                  <Controller
                    name="pstids"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {/* Search box */}
                        <input
                          type="text"
                          placeholder="Search subtypes..."
                          value={subtypeSearchTerm}
                          onChange={(e) => setSubtypeSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />

                        {/* Multi-select dropdown with grouped options */}
                        <div className="relative">
                          <select
                            multiple
                            value={field.value || []}
                            onChange={(e) => {
                              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                              field.onChange(selectedOptions);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                          >
                            {filteredGroupedPropertyTypes.length > 0 ? (
                              filteredGroupedPropertyTypes.map(type => (
                                <optgroup key={type.id} label={type.label}>
                                  {type.subtypes.map(subtype => (
                                    <option key={subtype.id} value={subtype.id}>
                                      {subtype.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))
                            ) : (
                              <option disabled>No subtypes found</option>
                            )}
                          </select>
                        </div>

                        {/* Selected subtypes display */}
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map(pstid => {
                              const subtype = subtypeOptions.find(opt => opt.id === pstid);
                              return subtype ? (
                                <span
                                  key={pstid}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                  {subtype.label}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newValue = field.value.filter(id => id !== pstid);
                                      field.onChange(newValue);
                                    }}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple subtypes. Leave empty for all types.
                  </p>
                </div>

                {/* Week Rate - Hidden for self-service (advertiser-only) */}
                {!isSelfService && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Week Rate (£) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('week_rate', {
                        required: !isSelfService ? 'Week rate is required' : false,
                        min: { value: 0, message: 'Week rate must be positive' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    {errors.week_rate && (
                      <p className="text-red-500 text-sm mt-1">{errors.week_rate.message}</p>
                    )}
                  </div>
                )}

                {/* Platform MoR Fields */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Platform MoR Settings</h4>

                  {/* Commission Percentage - Hidden for self-service (advertiser-only) */}
                  {!isSelfService && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Commission Percentage *</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        {...register('commission_percent', {
                          required: !isSelfService ? 'Commission percentage is required' : false,
                          min: { value: 0, message: 'Commission must be 0 or greater' },
                          max: { value: 100, message: 'Commission cannot exceed 100%' }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                      />
                      {errors.commission_percent && (
                        <p className="text-red-500 text-sm mt-1">{errors.commission_percent.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Platform commission percentage (default: 50%)
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('vat_registered')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">VAT Registered (UK)</span>
                    </label>
                  </div>

                  {isVatRegistered && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">VAT Number</label>
                      <input
                        type="text"
                        {...register('vat_number', {
                          required: isVatRegistered ? 'VAT number is required when VAT registered' : false,
                          pattern: {
                            value: /^GB[0-9]{9}$/,
                            message: 'VAT number must be in format: GB123456789'
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="GB123456789"
                      />
                      {errors.vat_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.vat_number.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        UK VAT number (e.g., GB123456789)
                      </p>
                    </div>
                  )}

                  {/* Platform Customer Section */}
                  {advertiser && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium mb-2">Platform Customer</label>

                      {stripeStatusLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Checking status...</span>
                        </div>
                      ) : hasPlatformCustomer ? (
                        <div className="space-y-2">
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 text-sm">
                              Platform customer created
                              {stripeStatus?.platform_customer_id && (
                                <span className="block text-xs text-green-700 mt-1 font-mono">
                                  {stripeStatus.platform_customer_id}
                                </span>
                              )}
                            </AlertDescription>
                          </Alert>
                        </div>
                      ) : hasStripeAccount ? (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 mb-2">
                            Create a platform customer for self-billing invoices
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => createPlatformCustomerMutation.mutate()}
                            disabled={createPlatformCustomerMutation.isPending}
                            className="w-full sm:w-auto"
                          >
                            {createPlatformCustomerMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Platform Customer
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Complete Stripe onboarding first to create platform customer
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>

                {/* Self-Billing Agreement Status */}
                {advertiser && !advertiser?.self_billing_agreement && advertiserOnboarded && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Advertiser must accept self-billing agreement before Platform MoR activation.
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSelfBillingContent(true)}
                        className="ml-2 mt-2"
                      >
                        Accept Agreement
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {advertiser?.self_billing_agreement && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Self-billing agreement accepted
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                    {error.response?.data?.error || 'An error occurred'}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex gap-2 pt-4 border-t -mx-6 px-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (advertiser ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Self-Billing Agreement Content */}
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Self-Billing Agreement
              </DialogTitle>
              <DialogDescription>
                Required for Platform Merchant of Record (MoR) model
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Back Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToForm}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Edit Advertiser
              </Button>

              {/* Info Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  This is a one-time agreement required before your first Platform MoR subscription can be activated.
                </AlertDescription>
              </Alert>

              {/* Agreement Content */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-3">Self-Billing Agreement Terms</h3>

                <div className="text-sm text-gray-700 space-y-3">
                  <p>
                    By accepting this agreement, <strong>{advertiser?.company}</strong> authorizes BizChat Ltd to:
                  </p>

                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>
                      <strong>Issue VAT invoices</strong> on your behalf for revenue share payments under UK VAT self-billing regulations
                    </li>
                    <li>
                      <strong>Collect payments</strong> from estate agents on your behalf as the Platform Merchant of Record
                    </li>
                    <li>
                      <strong>Deduct platform commission</strong> (as agreed in your advertiser terms) from collected payments
                    </li>
                    <li>
                      <strong>Transfer net proceeds</strong> to your connected Stripe account after commission deduction
                    </li>
                    <li>
                      <strong>Generate self-billing invoices</strong> showing the revenue share amount and applicable VAT
                    </li>
                  </ul>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> You remain responsible for:
                    </p>
                    <ul className="list-disc list-inside mt-1 text-sm text-yellow-700 ml-2">
                      <li>Maintaining accurate VAT registration (if applicable)</li>
                      <li>Declaring self-billed invoice amounts in your VAT returns</li>
                      <li>Keeping records of all self-billing transactions</li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-600 mt-4">
                    This agreement complies with HMRC VAT Notice 700/62 regarding self-billing arrangements.
                    You may revoke this agreement at any time, but doing so will prevent new Platform MoR subscriptions.
                  </p>
                </div>
              </div>

              {/* Acceptance Checkbox */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={setAgreed}
                  disabled={acceptMutation.isPending}
                />
                <label
                  htmlFor="agree"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and accept the self-billing agreement on behalf of {advertiser?.company}
                </label>
              </div>

              {/* Error Display */}
              {acceptMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {acceptMutation.error?.response?.data?.error || 'Failed to accept agreement. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToForm}
                  disabled={acceptMutation.isPending}
                  className="flex-1"
                >
                  Return
                </Button>
                <Button
                  type="button"
                  onClick={handleAcceptAgreement}
                  disabled={!agreed || acceptMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {acceptMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept & Continue
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
};

export default AdvertiserForm;