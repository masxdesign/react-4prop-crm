import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { addWeeks, format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/Auth/Auth-context';
import { toast } from '@/components/ui/use-toast';
import { createSchedule, activateSubscriptionPlatformMor } from '../api';
import MagazineCalendar from '../ui/MagazineCalendar';
import WeekPicker from '../ui/WeekPicker';
import AdvertiserPicker from '../ui/AdvertiserPicker';
import PaymentActivationForm from '../ui/PaymentActivationForm';
import { AgentEmailSearchField } from '../ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pluralizeWeeks } from '../util/pluralize';
import { Loader2, CreditCard } from 'lucide-react';

const ScheduleWizardModal = ({
  open,
  property,
  advertisers,
  agentId, // The agent's NID (for creating schedules)
  preselectedAdvertiser = null,
  onClose,
  onSubmit,
  createdSchedule = null, // Schedule created by parent (for self-assign payment flow)
  isLoading,
  error,
  showCancelButton = true,
  showDialogClose = true,
  cancelButtonText = "Cancel",
  isAdminViewing, // Not used currently, but passed for future enhancement
  viewingAgentNid // Not used currently, but passed for future enhancement
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [activationStep, setActivationStep] = useState(null); // null | 'creating' | 'activating' | 'success'
  const [paymentActivationState, setPaymentActivationState] = useState({
    canActivate: false,
    isActivating: false,
    activate: null
  });

  const auth = useAuth();
  const queryClient = useQueryClient();

  // React Hook Form setup
  const { control, watch, getValues, reset, setValue } = useForm({
    defaultValues: {
      advertiser_id: '',
      start_date: '',
      week_no: '',
      approver_id: '',
      approver_email: '',
      self_assign: false,
      payer_id: ''
    }
  });

  // Watch form values for calculations and validation
  const watchedValues = watch();

  // Handle preselected advertiser
  useEffect(() => {
    if (preselectedAdvertiser && open) {
      setValue('advertiser_id', preselectedAdvertiser.id.toString());
      // Auto-advance to step 2 when advertiser is preselected
      setCurrentStep(2);
    }
  }, [preselectedAdvertiser, open, setValue]);

  // Handle schedule creation for self-assign flow
  useEffect(() => {
    if (createdSchedule && watchedValues.self_assign) {
      // Advance to step 6 (payment) when schedule is created for self-assign
      setCurrentStep(6);
    }
  }, [createdSchedule, watchedValues.self_assign]);

  // Find selected advertiser for calculations
  const selectedAdvertiser = advertisers.find(adv => adv.id === parseInt(watchedValues.advertiser_id));

  // Calculate booking details
  const calculateBookingDetails = () => {
    if (!selectedAdvertiser || !watchedValues.week_no || !watchedValues.start_date) {
      return { totalPrice: 0, weeks: 0, endDate: '', weeklyRate: 0, vatAmount: 0, subtotal: 0 };
    }

    const weeks = parseInt(watchedValues.week_no) || 0;
    const weeklyRate = selectedAdvertiser.week_rate || 0;

    // Calculate subtotal (weekly rate × weeks)
    const subtotal = weeklyRate * weeks;

    // VAT is ALWAYS applied - Platform MoR is VAT registered
    const vatRate = 0.20; // UK VAT 20%
    const vatAmount = subtotal * vatRate;

    // Total price always includes VAT
    const totalPrice = subtotal + vatAmount;

    const endDate = weeks > 0 && watchedValues.start_date ?
      format(addWeeks(new Date(watchedValues.start_date), weeks), 'yyyy-MM-dd') : '';

    return { totalPrice, weeks, endDate, weeklyRate, vatAmount, subtotal };
  };

  const { totalPrice, weeks, endDate, weeklyRate, vatAmount, subtotal } = calculateBookingDetails();

  // Get selected approver info
  const getApproverInfo = () => {
    if (watchedValues.self_assign) {
      return {
        type: 'self_assign',
        name: auth?.user?.name || 'Current User',
        email: auth?.user?.email || 'N/A'
      };
    } else if (watchedValues.approver_id) {
      return {
        type: 'approver',
        name: 'Selected Approver',
        email: watchedValues.approver_email || `Agent ID: ${watchedValues.approver_id}`
      };
    }
    return null;
  };

  // Step validation
  const isStepValid = (step) => {
    switch (step) {
      case 1: return watchedValues.advertiser_id;
      case 2: return watchedValues.start_date;
      case 3: return watchedValues.week_no;
      case 4: return watchedValues.self_assign || watchedValues.approver_id;
      case 5: return true; // Summary step is always valid
      case 6: return true; // Payment step is always valid
      default: return false;
    }
  };

  // Navigation handlers
  const goNext = () => {
    // Max step is 6 for self-assign, 5 for external approver
    const maxStep = watchedValues.self_assign ? 6 : 5;
    if (currentStep < maxStep && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const values = getValues();

    // Ensure all required fields are present and valid
    const advertiser_id = parseInt(values.advertiser_id);
    const week_no = parseInt(values.week_no);

    const scheduleData = {
      property_id: property.pid,
      advertiser_id: isNaN(advertiser_id) ? null : advertiser_id,
      start_date: values.start_date || null,
      week_no: isNaN(week_no) ? null : week_no,
      self_assign: values.self_assign || false
    };

    // Include approver_id and payer_id based on self_assign status
    if (values.self_assign) {
      // For self_assign, set both approver_id and payer_id to current user
      scheduleData.approver_id = values.approver_id || null;
      scheduleData.payer_id = values.payer_id || null;
    } else {
      // For external approver, only send approver_id (payer_id will be set by approver later)
      scheduleData.approver_id = values.approver_id || null;
      scheduleData.payer_id = null;
    }

    // Validate required fields
    if (!scheduleData.property_id || !scheduleData.advertiser_id ||
        !scheduleData.start_date || !scheduleData.week_no) {
      console.error('Missing required fields:', {
        property_id: scheduleData.property_id,
        advertiser_id: scheduleData.advertiser_id,
        start_date: scheduleData.start_date,
        week_no: scheduleData.week_no
      });
      return;
    }

    // Pass additional metadata to help parent component decide behavior
    onSubmit(scheduleData, { isSelfAssign: values.self_assign });
  };

  // Handle zero-price activation (create + activate in one go)
  const handleActivateZeroPrice = async () => {
    const values = getValues();

    // Build schedule data (same as handleSubmit)
    const advertiser_id = parseInt(values.advertiser_id);
    const week_no = parseInt(values.week_no);

    const scheduleData = {
      property_id: property.pid,
      advertiser_id: isNaN(advertiser_id) ? null : advertiser_id,
      start_date: values.start_date || null,
      week_no: isNaN(week_no) ? null : week_no,
      self_assign: values.self_assign || false,
      approver_id: values.approver_id || null,
      payer_id: values.payer_id || null
    };

    // Validate required fields
    if (!scheduleData.property_id || !scheduleData.advertiser_id ||
        !scheduleData.start_date || !scheduleData.week_no) {
      console.error('Missing required fields for zero-price activation');
      return;
    }

    try {
      // Step 1: Create schedule
      setActivationStep('creating');
      const response = await createSchedule(agentId, scheduleData);

      // API returns: { success: true, data: { id: 123, ... }, message: "..." }
      const scheduleId = response?.data?.id;

      if (!scheduleId) {
        console.error('No schedule ID found in response:', response);
        throw new Error('Failed to get schedule ID from API response');
      }

      // Step 2: Activate subscription
      setActivationStep('activating');
      await activateSubscriptionPlatformMor(scheduleId);

      // Step 3: Success
      setActivationStep('success');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['property-schedules', property.pid] });
      queryClient.invalidateQueries({ queryKey: ['property-schedules-summary', property.pid] });

      // Show success toast
      toast({
        title: 'Subscription Activated!',
        description: 'Your FREE property listing is now active and will go live on the start date.',
      });

      // Brief delay to show success state, then close
      setTimeout(() => {
        handleClose();
      }, 500);

    } catch (error) {
      console.error('Zero-price activation failed:', error);
      setActivationStep(null);

      toast({
        variant: 'destructive',
        title: 'Activation Failed',
        description: error?.response?.data?.error || 'Failed to activate subscription. Please try again.',
      });
    }
  };

  const handleClose = () => {
    // Reset wizard and form state when closing
    setCurrentStep(1);
    setActivationStep(null);
    reset();
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AdvertiserPicker
            name="advertiser_id"
            label="Where should your property be advertised?"
            control={control}
            rules={{ required: 'Please select an advertiser' }}
            advertisers={advertisers}
            containerHeight="300px"
          />
        );

      case 2:
        return (
          <MagazineCalendar
            control={control}
            name="start_date"
            rules={{ required: 'Start date is required' }}
            label="When should your property be posted?"
            minDate={format(new Date(), 'yyyy-MM-dd')}
            propertyId={property.pid}
            advertiserId={watchedValues.advertiser_id}
          />
        );

      case 3:
        return (
          <WeekPicker
            name="week_no"
            label="How long should it be advertised?"
            control={control}
            rules={{
              required: 'Number of weeks is required',
              min: { value: 1, message: 'Must be at least 1 week' },
              max: { value: 52, message: 'Cannot exceed 52 weeks' }
            }}
            presetWeeks={[1, 4, 12]}
            inputProps={{
              inputDescription: endDate 
                ? `Calculated end date ${format(new Date(endDate), 'MMM dd, yyyy')}`
                : null
            }}
            renderButton={({ isSelected, onClick, disabled, week }) => {
              return (
                <Button
                  key={week}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  disabled={disabled}
                  onClick={onClick}
                  className="flex flex-col gap-0 leading-none"
                >
                  <span>
                    {pluralizeWeeks(week)}
                  </span>
                  {isSelected && endDate && (
                    <span className='text-xs opacity-50'>
                      {format(new Date(endDate), 'MMM dd, yyyy')}
                    </span>
                  )}
                </Button>
              )
            }}
          />
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Approver</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="self_assign"
                  checked={watchedValues.self_assign}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    if (isChecked) {
                      // Auto-assign the agent (whose properties we're managing) as approver and payer
                      // Use agentId (the agent's NID) not auth.user.neg_id (which could be super admin)
                      setValue('approver_id', agentId || '');
                      setValue('payer_id', agentId || '');
                      setValue('self_assign', true);
                    } else {
                      setValue('approver_id', '');
                      setValue('approver_email', '');
                      setValue('payer_id', '');
                      setValue('self_assign', false);
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <label htmlFor="self_assign" className="text-sm font-medium text-gray-700">
                  I will handle approval and payment myself
                </label>
              </div>
              
              {!watchedValues.self_assign && (
                <AgentEmailSearchField
                  name="approver_id"
                  control={control}
                  rules={{ required: 'Please select an approver' }}
                  label="Select Approver"
                  placeholder="Type agent email to search..."
                  className="max-w-md"
                  onAgentSelect={(agent) => {
                    setValue('approver_id', agent.nid);
                    setValue('approver_email', agent.email);
                  }}
                  selectedAgentEmail={watchedValues.approver_email}
                />
              )}
              
              {watchedValues.self_assign && (
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <p className="text-sm text-green-700">
                    You will be assigned as both the approver and payer for this schedule.
                    You'll proceed to checkout to complete the payment.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
            
            {/* Property Info */}
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-medium text-gray-900 mb-2">Property</h4>
              <p className="text-sm text-gray-600">{property.pid} - {property.pstids}</p>
            </div>

            {/* Approver Information */}
            {(() => {
              const approverInfo = getApproverInfo();
              return approverInfo && (
                <div className={`p-4 rounded border ${
                  approverInfo.type === 'self_assign' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    approverInfo.type === 'self_assign' 
                      ? 'text-green-900' 
                      : 'text-purple-900'
                  }`}>
                    {approverInfo.type === 'self_assign' ? 'Self-Assigned' : 'Approver Selected'}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={
                        approverInfo.type === 'self_assign' 
                          ? 'text-green-700' 
                          : 'text-purple-700'
                      }>
                        {approverInfo.type === 'self_assign' ? 'You will handle:' : 'Approver:'}
                      </span>
                      <span className="font-medium">{approverInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={
                        approverInfo.type === 'self_assign' 
                          ? 'text-green-700' 
                          : 'text-purple-700'
                      }>
                        Email:
                      </span>
                      <span className="font-medium">{approverInfo.email}</span>
                    </div>
                    {approverInfo.type === 'self_assign' && (
                      <p className="text-xs text-green-600 mt-2">
                        You will approve and pay for this schedule immediately.
                      </p>
                    )}
                    {approverInfo.type === 'approver' && (
                      <p className="text-xs text-purple-600 mt-2">
                        This person will need to approve and arrange payment for the schedule.
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Booking Details */}
            {selectedAdvertiser && weeks > 0 && watchedValues.start_date && (
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Advertiser:</span>
                    <span className="font-medium">{selectedAdvertiser.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Start Date:</span>
                    <span className="font-medium">{format(new Date(watchedValues.start_date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">End Date:</span>
                    <span className="font-medium">{endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Duration:</span>
                    <span className="font-medium">{weeks} week{weeks !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Week Rate:</span>
                    <span className="font-medium">
                      {weeklyRate === 0 ? <span className="text-green-700 font-bold">FREE</span> : `£${weeklyRate.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Subtotal:</span>
                    <span className="font-medium">£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">VAT (20%):</span>
                    <span className="font-medium">£{vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-3">
                    <span className="text-blue-700 font-medium">Total Price:</span>
                    <span className={`font-bold text-lg ${totalPrice === 0 ? 'text-green-700' : 'text-green-600'}`}>
                      {totalPrice === 0 ? 'FREE' : `£${totalPrice.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* What Happens Next - Self Assign */}
            {watchedValues.self_assign && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-md">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next: Subscription Setup
                </h4>
                <div className="space-y-3 text-sm text-amber-900">
                  <p className="font-medium">
                    Clicking "{totalPrice === 0 ? 'Activate subscription' : 'Setup subscription'}" will:
                  </p>
                  <ol className="space-y-2 ml-4 list-decimal">
                    {totalPrice > 0 ? (
                      <>
                        <li>
                          <strong>Create your schedule</strong> in an approved state
                        </li>
                        <li>
                          <strong>Show payment method selection</strong> - you'll see your saved cards and select which one to use as the default for this subscription
                        </li>
                        <li>
                          <strong>Activate the subscription</strong> - your selected card will be charged automatically:
                          <ul className="ml-4 mt-1 space-y-1 text-xs list-disc">
                            <li>
                              First charge of <strong>£{weeklyRate.toFixed(2)}</strong> (+ £{(weeklyRate * 0.20).toFixed(2)} VAT)
                              {' '}on <strong>{format(new Date(watchedValues.start_date), 'MMM dd, yyyy')}</strong>
                            </li>
                            {weeks > 1 && (
                              <li>
                                Then <strong>£{weeklyRate.toFixed(2)}</strong> (+ £{(weeklyRate * 0.20).toFixed(2)} VAT)
                                {' '}per week for {weeks - 1} more week{weeks - 1 !== 1 ? 's' : ''}
                              </li>
                            )}
                            <li>
                              Total: <strong>£{totalPrice.toFixed(2)}</strong> over {weeks} week{weeks !== 1 ? 's' : ''}
                              {' '}(includes £{vatAmount.toFixed(2)} VAT)
                            </li>
                          </ul>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <strong>Create and immediately activate your FREE subscription</strong> - this is a <strong className="text-green-700">FREE</strong> listing (no payment required):
                          <ul className="ml-4 mt-1 space-y-1 text-xs list-disc">
                            <li>
                              Weekly rate: <strong>£0.00</strong> (FREE)
                          </li>
                          <li>
                            Total cost: <strong>£0.00</strong> over {weeks} week{weeks !== 1 ? 's' : ''}
                          </li>
                          <li>
                            No payment method required - your subscription will be activated immediately
                          </li>
                        </ul>
                      </li>
                      </>
                    )}
                    <li>
                      <strong>Your property goes live</strong> in the magazine on the start date
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        // Payment step - only shown for self-assign flow
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activate Subscription</h3>

            {createdSchedule ? (
              <PaymentActivationForm
                schedule={createdSchedule}
                propertyId={property.pid}
                onSuccess={handleClose}
                onCancel={null} // No cancel button in step 6, use Back button instead
                isAdminViewing={isAdminViewing}
                viewingAgentNid={viewingAgentNid}
                hideButtons={true}
                onActivateStateChange={setPaymentActivationState}
              />
            ) : (
              <div className="text-center p-4 text-gray-500">
                Loading payment details...
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const advertiserName = selectedAdvertiser ? ` - ${selectedAdvertiser.company}` : '';
    switch (currentStep) {
      case 1: return 'Select Advertiser';
      case 2: return `Start Date${advertiserName}`;
      case 3: return `Duration${advertiserName}`;
      case 4: return `Select Approver${advertiserName}`;
      case 5: return `Summary & Confirmation${advertiserName}`;
      case 6: return `Payment${advertiserName}`;
      default: return 'Schedule Advertiser';
    }
  };

  return (
    <Dialog open={open} onOpenChange={showDialogClose ? handleClose : undefined}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col gap-0 p-0">
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle>
            {getStepTitle()} - Step {currentStep} of {watchedValues.self_assign ? 6 : 5}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {(watchedValues.self_assign ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]).map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step === currentStep
                      ? 'bg-blue-500'
                      : step < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Error Display */}
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded mt-4">
              {error.response?.data?.error || 'An error occurred while scheduling'}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-between px-6 pb-6 pt-4 shrink-0 border-t">
          {/* Cancel Button */}
          {showCancelButton && (
            <Button variant="outline" onClick={handleClose}>
              {cancelButtonText}
            </Button>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            {currentStep > 1 && currentStep !== 6 && (
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
            )}

            {currentStep < 5 ? (
              <Button
                onClick={goNext}
                disabled={!isStepValid(currentStep)}
              >
                Next
              </Button>
            ) : currentStep === 5 ? (
              <Button
                onClick={totalPrice === 0 && watchedValues.self_assign ? handleActivateZeroPrice : handleSubmit}
                disabled={(isLoading || activationStep !== null) || !selectedAdvertiser || !watchedValues.week_no || !watchedValues.start_date}
              >
                {(() => {
                  // Show activation steps for zero-price flow
                  if (totalPrice === 0 && watchedValues.self_assign) {
                    if (activationStep === 'creating') return 'Creating schedule...';
                    if (activationStep === 'activating') return 'Activating subscription...';
                    if (activationStep === 'success') return 'Success!';
                    return 'Activate subscription';
                  }
                  // Normal flow
                  if (isLoading) return 'Processing...';
                  return watchedValues.self_assign ? 'Setup subscription' : 'Create schedule';
                })()}
              </Button>
            ) : currentStep === 6 ? (
              <Button
                onClick={() => paymentActivationState.activate?.()}
                disabled={!paymentActivationState.canActivate || paymentActivationState.isActivating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {paymentActivationState.isActivating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Activating...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Activate Subscription
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleWizardModal;