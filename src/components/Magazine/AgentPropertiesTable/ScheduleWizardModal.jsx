import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { addWeeks, format } from 'date-fns';
import { useAuth } from '@/components/Auth/Auth-context';
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

const ScheduleWizardModal = ({
  open,
  property,
  advertisers,
  preselectedAdvertiser = null,
  onClose,
  onSubmit,
  createdSchedule = null, // Schedule created by parent (for self-assign payment flow)
  isLoading,
  error,
  showCancelButton = true,
  showDialogClose = true,
  cancelButtonText = "Cancel"
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const auth = useAuth();

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
      return { totalPrice: 0, weeks: 0, endDate: '' };
    }
    
    const weeks = parseInt(watchedValues.week_no) || 0;
    const totalPrice = weeks > 0 ? selectedAdvertiser.week_rate * weeks : 0;
    const endDate = weeks > 0 && watchedValues.start_date ? 
      format(addWeeks(new Date(watchedValues.start_date), weeks), 'yyyy-MM-dd') : '';
    
    return { totalPrice, weeks, endDate };
  };

  const { totalPrice, weeks, endDate } = calculateBookingDetails();

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

  const handleClose = () => {
    // Reset wizard and form state when closing
    setCurrentStep(1);
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
                      // Auto-assign current user as approver and payer
                      setValue('approver_id', auth?.user?.neg_id || '');
                      setValue('payer_id', auth?.user?.neg_id || '');
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
                    <span className="font-medium">£{selectedAdvertiser.week_rate}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-3">
                    <span className="text-blue-700 font-medium">Total Price:</span>
                    <span className="font-bold text-green-600 text-lg">£{totalPrice.toFixed(2)}</span>
                  </div>
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
      <DialogContent className="max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {getStepTitle()} - Step {currentStep} of {watchedValues.self_assign ? 6 : 5}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
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

        <DialogFooter className="flex justify-between">
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
                onClick={handleSubmit}
                disabled={isLoading || !totalPrice}
              >
                {isLoading ? 'Processing...' : (watchedValues.self_assign ? 'Continue to payment' : 'Create schedule')}
              </Button>
            ) : null /* Step 6 has its own submit button in PaymentActivationForm */}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleWizardModal;