import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addWeeks, format } from 'date-fns';
import InlineCalendar from '../ui/InlineCalendar';
import WeekPicker from '../ui/WeekPicker';
import AdvertiserPicker from '../ui/AdvertiserPicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ScheduleWizardModal = ({ 
  open, 
  property, 
  advertisers, 
  onClose, 
  onSubmit, 
  isLoading, 
  error,
  showCancelButton = true,
  showDialogClose = true,
  cancelButtonText = "Cancel"
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // React Hook Form setup
  const { control, watch, getValues, reset } = useForm({
    defaultValues: {
      advertiser_id: '',
      start_date: '',
      week_no: ''
    }
  });

  // Watch form values for calculations and validation
  const watchedValues = watch();

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

  // Step validation
  const isStepValid = (step) => {
    switch (step) {
      case 1: return watchedValues.advertiser_id;
      case 2: return watchedValues.start_date;
      case 3: return watchedValues.week_no;
      case 4: return true; // Summary step is always valid
      default: return false;
    }
  };

  // Navigation handlers
  const goNext = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
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
    onSubmit({
      property_id: property.id,
      advertiser_id: parseInt(values.advertiser_id),
      start_date: values.start_date,
      week_no: parseInt(values.week_no),
    });
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
            control={control}
            rules={{ required: 'Please select an advertiser' }}
            advertisers={advertisers}
            containerHeight="300px"
          />
        );

      case 2:
        return (
          <InlineCalendar
            control={control}
            name="start_date"
            rules={{ required: 'Start date is required' }}
            label="Start Date"
            minDate={format(new Date(), 'yyyy-MM-dd')}
          />
        );

      case 3:
        return (
          <WeekPicker
            name="week_no"
            control={control}
            rules={{
              required: 'Number of weeks is required',
              min: { value: 1, message: 'Must be at least 1 week' },
              max: { value: 52, message: 'Cannot exceed 52 weeks' }
            }}
            presetWeeks={[1, 2, 3, 4, 6, 8, 12]}
          />
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
            
            {/* Property Info */}
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-medium text-gray-900 mb-2">Property</h4>
              <p className="text-sm text-gray-600">{property.id} - {property.departmentName}</p>
            </div>

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

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Advertiser';
      case 2: return 'Choose Start Date';
      case 3: return 'Number of Weeks';
      case 4: return 'Confirm Booking';
      default: return 'Schedule Advertiser';
    }
  };

  return (
    <Dialog open={open} onOpenChange={showDialogClose ? handleClose : undefined}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {getStepTitle()} - Step {currentStep} of 4
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
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
            {currentStep > 1 && (
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button 
                onClick={goNext} 
                disabled={!isStepValid(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !totalPrice}
              >
                {isLoading ? 'Scheduling...' : `Schedule for £${totalPrice.toFixed(2)}`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleWizardModal;