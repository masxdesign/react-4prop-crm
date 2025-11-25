import { createFileRoute, redirect } from '@tanstack/react-router';
import StatsSelectionPage from '@/components/Stats/StatsSelectionPage/StatsSelectionPage';

export const Route = createFileRoute('/_auth/_dashboard/stats/select')({
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

    // Only super admins can access the selection page
    if (!auth.user?.is_admin) {
      // Redirect back to /stats which will redirect them to their own stats
      throw redirect({ to: '/stats' });
    }
  },
  component: StatsSelectionPage,
});
