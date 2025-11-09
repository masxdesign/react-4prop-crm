import { createFileRoute, redirect } from '@tanstack/react-router';
import { queryOptions } from '@tanstack/react-query';
import AgentSelectionTable from '@/components/Magazine/AgentSelectionTable/AgentSelectionTable';
import { fetchAgentsForSelection } from '@/components/Magazine/api';

const agentsQueryOptions = (search, limit, page, sortBy, order) =>
  queryOptions({
    queryKey: ['agents-selection', search, limit, page, sortBy, order],
    queryFn: () => fetchAgentsForSelection({ search, limit, page, sortBy, order }),
    enabled: !!search && search.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const Route = createFileRoute('/_auth/_dashboard/mag/agent/select')({
  validateSearch: (search) => ({
    search: search.search || '',
    limit: Number(search.limit) || 20,
    page: Number(search.page) || 1,
    sortBy: search.sortBy || 'surname',
    order: search.order || 'asc',
  }),
  beforeLoad: ({ context, search }) => {
    const auth = context.auth;

    // Only super admins can access the agent selection page
    if (!auth.user?.is_admin) {
      // Redirect back to magazine dashboard
      throw redirect({ to: '/crm/mag' });
    }

    // Add query options to context for data preloading
    return {
      agentsQueryOptions: agentsQueryOptions(
        search.search,
        search.limit,
        search.page,
        search.sortBy,
        search.order
      ),
    };
  },
  loader: async ({ context }) => {
    // Preload agents data if query is enabled
    if (context.agentsQueryOptions.enabled) {
      await context.queryClient.ensureQueryData(context.agentsQueryOptions);
    }
  },
  component: AgentSelectionTable,
});
