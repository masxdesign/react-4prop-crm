import React from 'react';
import { useForm } from 'react-hook-form';
import { addWeeks, format } from 'date-fns';

// Schedule Modal Component - Updated for week-based system
const ScheduleModal = ({ property, advertisers, onClose, onSubmit, isLoading, error }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  
  const watchedAdvertiserId = watch('advertiser_id');
  const watchedStartDate = watch('start_date');
  const watchedWeekNo = watch('week_no');
  
  // Find selected advertiser for price calculation
  const selectedAdvertiser = advertisers.find(adv => adv.id === parseInt(watchedAdvertiserId));
  
  // Calculate total price preview and end date
  const calculateValues = () => {
    if (!selectedAdvertiser || !watchedWeekNo || !watchedStartDate) {
      return { totalPrice: 0, weeks: 0, endDate: '' };
    }
    
    const weeks = parseInt(watchedWeekNo) || 0;
    const totalPrice = weeks > 0 ? selectedAdvertiser.week_rate * weeks : 0;
    const endDate = weeks > 0 && watchedStartDate ? 
      format(addWeeks(new Date(watchedStartDate), weeks), 'yyyy-MM-dd') : '';
    
    return { totalPrice, weeks, endDate };
  };
  
  const { totalPrice, weeks, endDate } = calculateValues();

  const handleFormSubmit = (data) => {
    onSubmit({
      property_id: property.id,
      advertiser_id: parseInt(data.advertiser_id),
      start_date: data.start_date,
      week_no: parseInt(data.week_no),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Schedule Advertiser</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Property</label>
            <input
              type="text"
              value={`${property.id} - ${property.departmentName}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Advertiser *</label>
            <select
              {...register('advertiser_id', { required: 'Please select an advertiser' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an advertiser...</option>
              {advertisers.map((advertiser) => (
                <option key={advertiser.id} value={advertiser.id}>
                  {advertiser.company} - £{advertiser.week_rate}/week
                </option>
              ))}
            </select>
            {errors.advertiser_id && (
              <p className="text-red-500 text-sm mt-1">{errors.advertiser_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date *</label>
            <input
              type="date"
              {...register('start_date', { required: 'Start date is required' })}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Number of Weeks *</label>
            <input
              type="number"
              min="1"
              max="52"
              {...register('week_no', { 
                required: 'Number of weeks is required',
                min: { value: 1, message: 'Must be at least 1 week' },
                max: { value: 52, message: 'Cannot exceed 52 weeks' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number of weeks"
            />
            {errors.week_no && (
              <p className="text-red-500 text-sm mt-1">{errors.week_no.message}</p>
            )}
          </div>

          {/* Price Calculation Preview */}
          {selectedAdvertiser && weeks > 0 && watchedStartDate && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Advertiser:</span>
                  <span className="font-medium">{selectedAdvertiser.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Start Date:</span>
                  <span className="font-medium">{format(new Date(watchedStartDate), 'MMM dd, yyyy')}</span>
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
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                  <span className="text-blue-700 font-medium">Total Price:</span>
                  <span className="font-bold text-green-600">£{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error.response?.data?.error || 'An error occurred while scheduling'}
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
              disabled={isLoading || !totalPrice}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Scheduling...' : `Schedule for £${totalPrice.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;