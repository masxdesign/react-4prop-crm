import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new advertiser hub with bookings tab
export const Route = createFileRoute('/_auth/_dashboard/booking-history/select')({
  beforeLoad: ({ search }) => {
    // Redirect to appropriate hub based on tab
    const tab = search.tab || 'advertisers';
    if (tab === 'agencies') {
      throw redirect({ to: '/agency', search: { tab: 'bookings' } });
    }
    throw redirect({ to: '/advertiser', search: { tab: 'bookings' } });
  },
});
