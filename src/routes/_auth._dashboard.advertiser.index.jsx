import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvertiserSelectionTable from '@/components/AdvertiserSelectionTable';
import AdvertiserForm from '@/components/Magazine/AdvertiserManagement/AdvertiserForm';
import { createAdvertiser } from '@/components/Magazine/api';

const DEFAULTS = {
  page: 1,
  limit: 20,
  search: '',
  sortBy: 'company',
  order: 'asc',
};

const cleanSearchParams = (params) => {
  const cleaned = {};
  if (params.page && params.page !== DEFAULTS.page) cleaned.page = params.page;
  if (params.limit && params.limit !== DEFAULTS.limit) cleaned.limit = params.limit;
  if (params.search && params.search !== DEFAULTS.search) cleaned.search = params.search;
  if (params.sortBy && params.sortBy !== DEFAULTS.sortBy) cleaned.sortBy = params.sortBy;
  if (params.order && params.order !== DEFAULTS.order) cleaned.order = params.order;
  return cleaned;
};

export const Route = createFileRoute('/_auth/_dashboard/advertiser/')({
  validateSearch: (search) => ({
    page: search.page,
    limit: search.limit,
    search: search.search,
    sortBy: search.sortBy,
    order: search.order,
  }),
  beforeLoad: ({ context }) => {
    const auth = context.auth;

    if (!auth.user?.is_admin) {
      if (auth.isAdvertiser && auth.user?.advertiser_id) {
        throw redirect({ to: `/advertiser/${auth.user.advertiser_id}/bookings` });
      }
      throw redirect({ to: '/' });
    }
  },
  component: function AdvertiserHub() {
    const urlSearch = Route.useSearch();
    const queryClient = useQueryClient();

    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

    const search = {
      page: urlSearch.page || DEFAULTS.page,
      limit: urlSearch.limit || DEFAULTS.limit,
      search: urlSearch.search || DEFAULTS.search,
      sortBy: urlSearch.sortBy || DEFAULTS.sortBy,
      order: urlSearch.order || DEFAULTS.order,
    };

    // Create advertiser mutation
    const createMutation = useMutation({
      mutationFn: createAdvertiser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['advertisers-list'] });
        queryClient.invalidateQueries({ queryKey: ['advertisers'] });
        setIsCreateFormOpen(false);
      },
    });

    const handleCreateSubmit = (data) => {
      createMutation.mutate(data);
    };

    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advertiser</h1>
              <p className="text-gray-600 mt-1">Manage advertisers, view booking history, and analyze statistics</p>
            </div>
            <Button
              variant="gradient"
              onClick={() => setIsCreateFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Advertiser
            </Button>
          </div>

          <AdvertiserSelectionTable
            basePath="/advertiser"
            cleanSearchParams={cleanSearchParams}
            DEFAULTS={DEFAULTS}
            navigationPrefix="/advertiser"
            urlSearch={search}
            showActionButtons
            showManageButtons
          />
        </div>

        {/* Create Advertiser Form Dialog */}
        <AdvertiserForm
          open={isCreateFormOpen}
          onOpenChange={setIsCreateFormOpen}
          advertiser={null}
          onClose={() => setIsCreateFormOpen(false)}
          onSubmit={handleCreateSubmit}
          isLoading={createMutation.isPending}
          error={createMutation.error}
        />
      </div>
    );
  },
});
