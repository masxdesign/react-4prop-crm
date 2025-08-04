import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import bizchatClient from '@/services/bizchatClient';

// API functions for advertiser management
const fetchAllAdvertisers = async () => {
  const response = await bizchatClient.get('/api/crm/mag/advertisers');
  return response.data;
};

const createAdvertiser = async (advertiserData) => {
  const response = await bizchatClient.post('/api/crm/mag/advertisers', advertiserData);
  return response.data;
};

const updateAdvertiser = async ({ id, ...advertiserData }) => {
  const response = await bizchatClient.put(`/api/crm/mag/advertisers/${id}`, advertiserData);
  return response.data;
};

const deleteAdvertiser = async (id) => {
  const response = await bizchatClient.delete(`/api/crm/mag/advertisers/${id}`);
  return response.data;
};

// Advertiser Form Component
const AdvertiserForm = ({ advertiser, onClose, onSubmit, isLoading, error }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: advertiser || {
      company: '',
      pstids: '',
      day_rate: ''
    }
  });

  const handleFormSubmit = (data) => {
    // Format pstids to ensure proper comma-delimited format
    const formattedData = {
      ...data,
      pstids: data.pstids ? `,${data.pstids.split(',').map(id => id.trim()).join(',')},` : '',
      day_rate: parseFloat(data.day_rate)
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
            <label className="block text-sm font-medium mb-1">Day Rate *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('day_rate', { 
                required: 'Day rate is required',
                min: { value: 0, message: 'Day rate must be positive' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.day_rate && (
              <p className="text-red-500 text-sm mt-1">{errors.day_rate.message}</p>
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

// Main Advertiser Management Component
export const AdvertiserManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdvertiser, setEditingAdvertiser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch advertisers
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['advertisers'],
    queryFn: fetchAllAdvertisers,
  });

  // Create advertiser mutation
  const createMutation = useMutation({
    mutationFn: createAdvertiser,
    onSuccess: () => {
      queryClient.invalidateQueries(['advertisers']);
      setIsFormOpen(false);
    },
  });

  // Update advertiser mutation
  const updateMutation = useMutation({
    mutationFn: updateAdvertiser,
    onSuccess: () => {
      queryClient.invalidateQueries(['advertisers']);
      setEditingAdvertiser(null);
      setIsFormOpen(false);
    },
  });

  // Delete advertiser mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAdvertiser,
    onSuccess: () => {
      queryClient.invalidateQueries(['advertisers']);
    },
  });

  const advertisers = data?.data || [];
  
  // Filter advertisers based on search term
  const filteredAdvertisers = advertisers.filter(advertiser =>
    advertiser.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advertiser.id.toString().includes(searchTerm)
  );

  const handleEdit = (advertiser) => {
    setEditingAdvertiser(advertiser);
    setIsFormOpen(true);
  };

  const handleDelete = (advertiser) => {
    if (window.confirm(`Are you sure you want to delete "${advertiser.company}"?`)) {
      deleteMutation.mutate(advertiser.id);
    }
  };

  const handleFormSubmit = (data) => {
    if (editingAdvertiser) {
      updateMutation.mutate({ id: editingAdvertiser.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAdvertiser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading advertisers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">Error loading advertisers</div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advertiser Management</h2>
          <p className="text-gray-600">Manage advertising companies and their rates</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Advertiser
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search advertisers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <div className="text-sm text-gray-600">
          Showing {filteredAdvertisers.length} of {advertisers.length} advertisers
        </div>
      </div>

      {/* Advertisers Grid */}
      {filteredAdvertisers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? 'No advertisers match your search.' : 'No advertisers found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvertisers.map((advertiser) => (
            <div key={advertiser.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{advertiser.company}</h3>
                  <p className="text-sm text-gray-500">ID: {advertiser.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${advertiser.day_rate}/day
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Property Subtypes:</span>
                  <div className="text-sm">
                    {advertiser.pstids 
                      ? advertiser.pstids.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ')
                      : 'All types'
                    }
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(advertiser)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(advertiser)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <AdvertiserForm
          advertiser={editingAdvertiser}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
          isLoading={editingAdvertiser ? updateMutation.isPending : createMutation.isPending}
          error={editingAdvertiser ? updateMutation.error : createMutation.error}
        />
      )}
    </div>
  );
};

// Quick Stats Component
export const AdvertiserStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['advertisers'],
    queryFn: fetchAllAdvertisers,
  });

  if (isLoading) return <div className="text-sm text-gray-500">Loading stats...</div>;

  const advertisers = data?.data || [];
  const totalAdvertisers = advertisers.length;
  const avgDayRate = advertisers.length > 0 
    ? (advertisers.reduce((sum, adv) => sum + parseFloat(adv.day_rate), 0) / advertisers.length).toFixed(2)
    : 0;
  const highestRate = advertisers.length > 0 
    ? Math.max(...advertisers.map(adv => parseFloat(adv.day_rate))).toFixed(2)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-gray-900">{totalAdvertisers}</div>
        <div className="text-sm text-gray-500">Total Advertisers</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-blue-600">${avgDayRate}</div>
        <div className="text-sm text-gray-500">Average Day Rate</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-green-600">${highestRate}</div>
        <div className="text-sm text-gray-500">Highest Day Rate</div>
      </div>
    </div>
  );
};