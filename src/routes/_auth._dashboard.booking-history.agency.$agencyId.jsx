import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new route structure
export const Route = createFileRoute('/_auth/_dashboard/booking-history/agency/$agencyId')({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: `/agency/${params.agencyId}/bookings`,
      search
    });
  },
});
