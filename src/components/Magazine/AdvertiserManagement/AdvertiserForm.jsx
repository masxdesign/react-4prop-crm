import React from 'react';
import { useForm } from 'react-hook-form';

// Advertiser Form Component - Updated for week-based system
const AdvertiserForm = ({ advertiser, onClose, onSubmit, isLoading, error }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: advertiser || {
      company: '',
      pstids: '',
      week_rate: ''
    }
  });

  const handleFormSubmit = (data) => {
    // Format pstids to ensure proper comma-delimited format
    const formattedData = {
      ...data,
      pstids: data.pstids ? `,${data.pstids.split(',').map(id => id.trim()).join(',')},` : '',
      week_rate: parseFloat(data.week_rate)
    };
    onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {advertiser ? 'Edit Advertiser' : 'Add New Advertiser'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

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
    </div>
  );
};

export default AdvertiserForm;