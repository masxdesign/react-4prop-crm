import { createFileRoute } from '@tanstack/react-router'
import { streetLocationDetailQuery } from '@/features/streetLocations/streetLocations.queries'
import StreetDetail from '@/components/StreetLocations/StreetDetail'

export const Route = createFileRoute(
  '/_auth/_dashboard/admin/street-locations/$prefix/$streetLocationId'
)({
  beforeLoad: ({ context, params }) => {
    return {
      ...context,
      streetDetailQueryOptions: streetLocationDetailQuery(params.streetLocationId),
    }
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(context.streetDetailQueryOptions)
  },
  component: function StreetDetailPage() {
    const { prefix, streetLocationId } = Route.useParams()
    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6">
          <StreetDetail prefix={prefix} streetLocationId={streetLocationId} />
        </div>
      </div>
    )
  },
})
