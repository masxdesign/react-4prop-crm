import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect to new agency hub with agents tab
export const Route = createFileRoute('/_auth/_dashboard/mag/agent/select')({
  beforeLoad: () => {
    throw redirect({ to: '/agency', search: { tab: 'agents' } });
  },
});
