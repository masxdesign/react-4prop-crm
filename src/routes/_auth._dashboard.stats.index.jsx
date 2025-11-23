import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_dashboard/stats/')({
  beforeLoad: ({ context }) => {
    const auth = context.auth;

    if (auth.user?.is_admin) {
      throw redirect({ to: '/stats/select', mask: { to: '/stats' } });
    } else if (auth.isAdvertiser && auth.user?.advertiser_id) {
      throw redirect({ to: `/stats/advertiser/${auth.user.advertiser_id}`, mask: { to: '/stats' } });
    } else if (auth.isAgent && auth.user?.cid) {
      throw redirect({ to: `/stats/agency/${auth.user.cid}`, mask: { to: '/stats' } });
    }
  },
});
