import { createFileRoute, redirect } from '@tanstack/react-router';
import StatsSelectionPage from '@/components/Stats/StatsSelectionPage/StatsSelectionPage';

export const Route = createFileRoute('/_auth/_dashboard/stats/select')({
  validateSearch: (search) => ({
    tab: search.tab || 'advertisers', // 'advertisers' or 'agencies'
    page: search.page || 1,
    limit: search.limit || 20,
    search: search.search || '',
    sortBy: search.sortBy || (search.tab === 'agencies' ? 'name' : 'company'),
    order: search.order || 'asc',
  }),
  beforeLoad: ({ context }) => {
    const auth = context.auth;

    // Only super admins can access the selection page
    if (!auth.user?.is_admin) {
      // Redirect back to /stats which will redirect them to their own stats
      throw redirect({ to: '/crm/stats' });
    }
  },
  component: StatsSelectionPage,
});
