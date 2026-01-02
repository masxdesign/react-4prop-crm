import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect to new agency hub agent detail page
export const Route = createFileRoute("/_auth/_dashboard/mag/agent/$nid")({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: `/agency/agent/${params.nid}`,
      search
    });
  },
});
