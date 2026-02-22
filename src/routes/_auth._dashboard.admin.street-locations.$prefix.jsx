import { createFileRoute, Outlet } from '@tanstack/react-router'
import { streetLocationsByPrefixQuery } from '@/features/streetLocations/streetLocations.queries'

export const Route = createFileRoute(
  '/_auth/_dashboard/admin/street-locations/$prefix'
)({
  beforeLoad: ({ context, params }) => {
    return {
      ...context,
      streetsQueryOptions: streetLocationsByPrefixQuery(params.prefix),
    }
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(context.streetsQueryOptions)
  },
  component: function PrefixLayout() {
    return <Outlet />
  },
})
