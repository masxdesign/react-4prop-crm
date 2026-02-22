import { createFileRoute } from '@tanstack/react-router'
import StreetsList from '@/components/StreetLocations/StreetsList'

export const Route = createFileRoute(
  '/_auth/_dashboard/admin/street-locations/$prefix/'
)({
  validateSearch: (search) => ({
    filter: search.filter || '',
  }),
  component: function StreetsListPage() {
    const { prefix } = Route.useParams()
    const { filter } = Route.useSearch()
    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6">
          <StreetsList prefix={prefix} filter={filter} />
        </div>
      </div>
    )
  },
})
