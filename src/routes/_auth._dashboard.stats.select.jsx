import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new advertiser hub with stats tab
export const Route = createFileRoute('/_auth/_dashboard/stats/select')({
  beforeLoad: ({ search }) => {
    // Redirect to appropriate hub based on tab
    const tab = search.tab || 'advertisers';
    if (tab === 'agencies') {
      throw redirect({ to: '/agency', search: { tab: 'stats' } });
    }
    throw redirect({ to: '/advertiser', search: { tab: 'stats' } });
  },
});
