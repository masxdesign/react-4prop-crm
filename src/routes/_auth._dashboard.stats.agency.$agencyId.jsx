import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new route structure
export const Route = createFileRoute('/_auth/_dashboard/stats/agency/$agencyId')({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: `/agency/${params.agencyId}/stats`,
      search
    });
  },
});
