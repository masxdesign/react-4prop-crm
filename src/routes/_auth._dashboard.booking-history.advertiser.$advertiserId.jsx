import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new route structure
export const Route = createFileRoute('/_auth/_dashboard/booking-history/advertiser/$advertiserId')({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: `/advertiser/${params.advertiserId}/bookings`,
      search
    });
  },
});
