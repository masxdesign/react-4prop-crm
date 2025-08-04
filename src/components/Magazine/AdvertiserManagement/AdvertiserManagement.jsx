import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bizchatClient from '@/services/bizchatClient';
import AdvertiserForm from './AdvertiserForm';
import AdvertiserCard from './AdvertiserCard';

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

// Main Advertiser Management Component - Updated for week-based system
const AdvertiserManagement = () => {
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
    deleteMutation.mutate(advertiser.id);
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
          <p className="text-gray-600">Manage advertising companies and their weekly rates</p>
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
          <div className="text-gray-400 text-6xl mb-4">📢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching advertisers found' : 'No advertisers yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Get started by adding your first advertiser'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add First Advertiser
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvertisers.map((advertiser) => (
            <AdvertiserCard
              key={advertiser.id}
              advertiser={advertiser}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === advertiser.id}
            />
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

      {/* Delete Loading Indicator */}
      {deleteMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">
          Deleting advertiser...
        </div>
      )}
    </div>
  );
};

export default AdvertiserManagement;