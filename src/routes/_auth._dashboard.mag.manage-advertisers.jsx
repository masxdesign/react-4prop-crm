import { createFileRoute, redirect } from "@tanstack/react-router"

// Redirect to new advertiser hub
export const Route = createFileRoute("/_auth/_dashboard/mag/manage-advertisers")({
  beforeLoad: () => {
    throw redirect({ to: '/advertiser', search: { tab: 'manage' } });
  },
})