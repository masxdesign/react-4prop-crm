import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_dashboard/booking-history/')({
  beforeLoad: ({ context }) => {
    const auth = context.auth;

    if (auth.user?.is_admin) {
      throw redirect({ to: '/booking-history/select', mask: { to: '/booking-history' } });
    } else if (auth.isAdvertiser && auth.user?.advertiser_id) {
      throw redirect({ to: `/booking-history/advertiser/${auth.user.advertiser_id}`, mask: { to: '/booking-history' } });
    } else if (auth.isAgent && auth.user?.cid) {
      throw redirect({ to: `/booking-history/agency/${auth.user.cid}`, mask: { to: '/booking-history' } });
    }
  },
});
