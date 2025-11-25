import { createFileRoute, redirect } from '@tanstack/react-router';
import BookingHistorySelectionPage from '@/components/Magazine/BookingHistory/BookingHistorySelectionPage/BookingHistorySelectionPage';

export const Route = createFileRoute('/_auth/_dashboard/booking-history/select')({
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

    // Only admins can access the selection page
    if (!auth.user?.is_admin) {
      throw redirect({ to: '/booking-history' });
    }
  },
  component: BookingHistorySelectionPage,
});
