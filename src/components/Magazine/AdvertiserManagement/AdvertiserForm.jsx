import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import SelfBillingAgreementDialog from '../dialogs/SelfBillingAgreementDialog';

// Advertiser Form Component - Updated for week-based system
const AdvertiserForm = ({ open, onOpenChange, advertiser, onClose, onSubmit, isLoading, error }) => {
  const [showSelfBillingDialog, setShowSelfBillingDialog] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    values: advertiser || {
      company: '',
      pstids: '',
      week_rate: '',
      vat_registered: false,
      vat_number: '',
      commission_percent: 50
    }
  });

  const advertiserOnboarded = true

  const isVatRegistered = watch('vat_registered');

  const handleFormSubmit = (data) => {
    // Format pstids to ensure proper comma-delimited format
    const formattedData = {
      ...data,
      pstids: data.pstids ? `,${data.pstids.split(',').map(id => id.trim()).join(',')},` : '',
      week_rate: parseFloat(data.week_rate),
      commission_percent: parseFloat(data.commission_percent) || 50,
      vat_registered: Boolean(data.vat_registered),
      vat_number: data.vat_registered ? data.vat_number : ''
    };
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {advertiser ? 'Edit Advertiser' : 'Add New Advertiser'}
          </DialogTitle>
          <DialogDescription>
            Required for Platform Merchant of Record (MoR) model
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium mb-1">Property Subtype IDs</label>
              <input
                type="text"
                {...register('pstids')}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1,2,3,4 (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter property subtype IDs separated by commas (optional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Week Rate (£) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('week_rate', {
                  required: 'Week rate is required',
                  min: { value: 0, message: 'Week rate must be positive' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              {errors.week_rate && (
                <p className="text-red-500 text-sm mt-1">{errors.week_rate.message}</p>
              )}
            </div>

            {/* Platform MoR Fields */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Platform MoR Settings</h4>

              <div>
                <label className="block text-sm font-medium mb-1">Commission Percentage *</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  {...register('commission_percent', {
                    required: 'Commission percentage is required',
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
            </div>

            {/* Self-Billing Agreement Status */}
            {!advertiser?.self_billing_agreement && advertiserOnboarded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Advertiser must accept self-billing agreement before Platform MoR activation.
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSelfBillingDialog(true)}
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

            <div className="flex gap-2 pt-4">
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
        </div>
      </DialogContent>

      {/* Self-Billing Agreement Dialog */}
      <SelfBillingAgreementDialog
        open={showSelfBillingDialog}
        onOpenChange={setShowSelfBillingDialog}
        advertiserId={advertiser?.id}
        advertiserName={advertiser?.company}
        onAccepted={() => {
          // Refresh advertiser status to get updated self-billing flag
          queryClient.invalidateQueries({ queryKey: ['advertiser-stripe-status', schedule?.advertiser_id] });
          toast({
            title: 'Agreement Accepted',
            description: 'Self-billing agreement has been accepted. You can now activate the subscription.',
          });
        }}
      />
    </Dialog>
  )
};

export default AdvertiserForm;