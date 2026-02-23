import { createFileRoute } from '@tanstack/react-router'
import RegionGrid from '@/components/StreetLocations/RegionGrid'

export const Route = createFileRoute('/_auth/_dashboard/admin/street-locations/')({
  component: function StreetLocationsIndexPage() {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-3 md:p-6">
          <RegionGrid />
        </div>
      </div>
    )
  },
})
