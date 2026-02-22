import { Link } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const REGIONS = {
  E: 'East London',
  SE: 'South East London',
  SW: 'South West London',
  N: 'North London',
  NW: 'North West London',
  W: 'West London',
  EC: 'Central London (City of London)',
  WC: 'Central London (West End)',
}

export default function RegionGrid() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Street Locations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a region to view street locations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(REGIONS).map(([prefix, name]) => (
          <Link
            key={prefix}
            to="/admin/street-locations/$prefix"
            params={{ prefix }}
            className="hover:no-underline"
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{prefix}</CardTitle>
                </div>
                <CardDescription>{name}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
