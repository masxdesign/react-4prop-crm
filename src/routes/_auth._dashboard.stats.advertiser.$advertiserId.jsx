import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new route structure
export const Route = createFileRoute('/_auth/_dashboard/stats/advertiser/$advertiserId')({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: `/advertiser/${params.advertiserId}/stats`,
      search
    });
  },
});
