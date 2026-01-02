import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AdvertiserManagement from '@/components/Magazine/AdvertiserManagement/AdvertiserManagement';
import AdvertiserSelectionTable from '@/components/AdvertiserSelectionTable';

const DEFAULTS = {
  tab: 'manage',
  page: 1,
  limit: 20,
  search: '',
  sortBy: { manage: 'company', bookings: 'company', stats: 'company' },
  order: 'asc',
};

const cleanSearchParams = (params, tab) => {
  const cleaned = {};
  if (params.tab && params.tab !== DEFAULTS.tab) cleaned.tab = params.tab;
  if (params.page && params.page !== DEFAULTS.page) cleaned.page = params.page;
  if (params.limit && params.limit !== DEFAULTS.limit) cleaned.limit = params.limit;
  if (params.search && params.search !== DEFAULTS.search) cleaned.search = params.search;
  const defaultSortBy = DEFAULTS.sortBy[tab || params.tab || DEFAULTS.tab];
  if (params.sortBy && params.sortBy !== defaultSortBy) cleaned.sortBy = params.sortBy;
  if (params.order && params.order !== DEFAULTS.order) cleaned.order = params.order;
  return cleaned;
};

export const Route = createFileRoute('/_auth/_dashboard/advertiser/')({
  validateSearch: (search) => ({
    tab: search.tab,
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
    const navigate = useNavigate();

    const search = {
      tab: urlSearch.tab || DEFAULTS.tab,
      page: urlSearch.page || DEFAULTS.page,
      limit: urlSearch.limit || DEFAULTS.limit,
      search: urlSearch.search || DEFAULTS.search,
      sortBy: urlSearch.sortBy || DEFAULTS.sortBy[urlSearch.tab || DEFAULTS.tab],
      order: urlSearch.order || DEFAULTS.order,
    };

    const handleTabChange = (newTab) => {
      const params = cleanSearchParams({
        tab: newTab,
        page: 1,
        limit: search.limit,
        search: '',
        sortBy: DEFAULTS.sortBy[newTab],
        order: 'asc',
      }, newTab);

      navigate({ to: '/advertiser', search: params, replace: true });
    };

    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advertiser</h1>
            <p className="text-gray-600 mt-1">Manage advertisers, view booking history, and analyze statistics</p>
          </div>

          <Tabs value={search.tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="manage">Manage</TabsTrigger>
              <TabsTrigger value="bookings">Booking History</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="mt-6">
              <AdvertiserManagement />
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <AdvertiserSelectionTable
                variant="booking-history"
                basePath="/advertiser"
                cleanSearchParams={cleanSearchParams}
                DEFAULTS={DEFAULTS}
                navigationPrefix="/advertiser"
                urlSearch={search}
              />
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <AdvertiserSelectionTable
                variant="stats"
                basePath="/advertiser"
                cleanSearchParams={cleanSearchParams}
                DEFAULTS={DEFAULTS}
                navigationPrefix="/advertiser"
                urlSearch={search}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  },
});
