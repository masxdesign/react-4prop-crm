import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import StreetsList from '@/components/StreetLocations/StreetsList'
import { fetchBulkStatus } from '@/services/streetLocationService'

export const Route = createFileRoute(
  '/_auth/_dashboard/admin/street-locations/$prefix/'
)({
  validateSearch: (search) => ({
    filter: search.filter || '',
  }),
  loader: async ({ context }) => {
    const streets = await context.queryClient.ensureQueryData(context.streetsQueryOptions)
    const ids = streets?.map(s => s.id) ?? []
    if (ids.length > 0) {
      context.queryClient.prefetchQuery({
        queryKey: ['streetStatus', 'poll', 'list'],
        queryFn: () => fetchBulkStatus(ids),
        staleTime: 5000,
      })
    }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
  component: function StreetsListPage() {
    const { prefix } = Route.useParams()
    const { filter } = Route.useSearch()
    return (
      <div className="h-full flex flex-col">
        <StreetsList prefix={prefix} filter={filter} />
      </div>
    )
  },
})
