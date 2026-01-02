import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new routes - admins go to hub, others to their direct pages
export const Route = createFileRoute('/_auth/_dashboard/booking-history/')({
  beforeLoad: ({ context }) => {
    const auth = context.auth;

    if (auth.user?.is_admin) {
      throw redirect({ to: '/advertiser', search: { tab: 'bookings' } });
    } else if (auth.isAdvertiser && auth.user?.advertiser_id) {
      throw redirect({ to: `/advertiser/${auth.user.advertiser_id}/bookings` });
    } else if (auth.isAgent && auth.user?.cid) {
      throw redirect({ to: `/agency/${auth.user.cid}/bookings` });
    }
  },
});
