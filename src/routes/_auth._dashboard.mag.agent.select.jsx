import { createFileRoute, redirect } from '@tanstack/react-router';
import AgentSelectionTable from '@/components/Magazine/AgentSelectionTable/AgentSelectionTable';

export const Route = createFileRoute('/_auth/_dashboard/mag/agent/select')({
  validateSearch: (search) => ({
    search: search.search,
    limit: search.limit,
  }),
  beforeLoad: ({ context }) => {
    const auth = context.auth;

    // Only super admins can access the agent selection page
    if (!auth.user?.is_admin) {
      // Redirect back to magazine dashboard
      throw redirect({ to: '/crm/mag' });
    }
  },
  component: AgentSelectionTable,
});
