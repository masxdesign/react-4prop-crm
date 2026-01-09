import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new routes - admins go to hub, others to their direct pages
export const Route = createFileRoute('/_auth/_dashboard/stats/')({
  beforeLoad: ({ context }) => {
    const auth = context.auth;

    if (auth.user?.is_admin) {
      throw redirect({ to: '/advertiser', search: { tab: 'stats' } });
    } else if (auth.isAdvertiser && auth.user?.advertiser_id) {
      throw redirect({ to: `/advertiser/${auth.user.advertiser_id}/stats` });
    } else if (auth.isAgent && auth.user?.cid) {
      throw redirect({ to: `/agency/${auth.user.cid}/stats` });
    }
  },
});
