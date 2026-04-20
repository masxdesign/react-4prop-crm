import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AgentSelectionTable from '@/components/Magazine/AgentSelectionTable/AgentSelectionTable';
import AgencySelectionTable from '@/components/AgencySelectionTable';

const DEFAULTS = {
  tab: 'agencies',
  page: 1,
  limit: 20,
  search: '',
  sortBy: { agents: 'surname', agencies: 'name' },
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

export const Route = createFileRoute('/_auth/_dashboard/agency/')({
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
      if (auth.isAgent && auth.user?.cid) {
        throw redirect({ to: `/agency/${auth.user.cid}/bookings` });
      }
      throw redirect({ to: '/' });
    }
  },
  component: function AgencyHub() {
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

      navigate({ to: '/agency', search: params, replace: true });
    };

    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agency</h1>
            <p className="text-gray-600 mt-1">View agent properties, booking history, and agency statistics</p>
          </div>

          <Tabs value={search.tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="agencies">Agencies</TabsTrigger>
              <TabsTrigger value="agents">Agent Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="agencies" className="mt-6">
              <AgencySelectionTable
                basePath="/agency"
                cleanSearchParams={cleanSearchParams}
                DEFAULTS={DEFAULTS}
                navigationPrefix="/agency"
                urlSearch={search}
                showActionButtons
              />
            </TabsContent>

            <TabsContent value="agents" className="mt-6">
              <AgentSelectionTable
                basePath="/agency"
                cleanSearchParams={cleanSearchParams}
                DEFAULTS={DEFAULTS}
                navigationPrefix="/agency/agent"
                embedded
                urlSearch={search}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  },
});
