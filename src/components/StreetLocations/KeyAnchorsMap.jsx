import { useState, useRef, useCallback } from 'react'
import { Map, Marker, Popup } from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

const CATEGORY_COLORS = {
  museum: '#8B5CF6',
  park: '#22C55E',
  landmark: '#F59E0B',
  flagship_retail: '#3B82F6',
  supermarket: '#EF4444',
  health_club: '#EC4899',
  theatre: '#F97316',
}
const DEFAULT_COLOR = '#6B7280'

function formatCategory(cat) {
  return cat
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function PinSvg({ color, size = 'h-6 w-6' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${size} drop-shadow-lg`}
      style={{ color }}
    >
      <path
        fillRule="evenodd"
        d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function KeyAnchorsMap({ anchors, centerLat, centerLon, height = 400 }) {
  const [selected, setSelected] = useState(null)
  const mapRef = useRef(null)

  // Parse anchors if string
  let items = anchors
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items)
    } catch {
      items = []
    }
  }
  if (!Array.isArray(items)) items = []

  // Filter to anchors with valid coordinates
  const validAnchors = items.filter(
    (a) => a.lat != null && a.lon != null && !isNaN(a.lat) && !isNaN(a.lon)
  )

  const hasCenter = centerLat != null && centerLon != null && !isNaN(centerLat) && !isNaN(centerLon)

  // Only fit bounds once on map load — not on re-renders
  const handleLoad = useCallback((e) => {
    const map = e.target
    mapRef.current = map

    const points = validAnchors.map((a) => [Number(a.lon), Number(a.lat)])
    if (hasCenter) points.push([Number(centerLon), Number(centerLat)])
    if (points.length === 0) return

    if (points.length === 1) {
      map.flyTo({ center: points[0], zoom: 15 })
      return
    }

    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity
    for (const [lon, lat] of points) {
      if (lon < minLon) minLon = lon
      if (lon > maxLon) maxLon = lon
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }

    map.fitBounds(
      [[minLon, minLat], [maxLon, maxLat]],
      { padding: 50, maxZoom: 16, duration: 0 }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (validAnchors.length === 0) {
    return (
      <div
        className="rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
        style={{ height }}
      >
        No anchor coordinates available
      </div>
    )
  }

  // Collect unique categories for legend
  const categories = [...new Set(validAnchors.map((a) => a.category).filter(Boolean))]

  const defaultCenter = hasCenter
    ? { longitude: Number(centerLon), latitude: Number(centerLat) }
    : { longitude: Number(validAnchors[0].lon), latitude: Number(validAnchors[0].lat) }

  return (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
        <Map
          initialViewState={{
            longitude: defaultCenter.longitude,
            latitude: defaultCenter.latitude,
            zoom: 15,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          attributionControl={false}
          onLoad={handleLoad}
        >
          {/* Center pin for the street location */}
          {hasCenter && (
            <Marker
              longitude={Number(centerLon)}
              latitude={Number(centerLat)}
              anchor="bottom"
            >
              <PinSvg color="#2563EB" size="h-8 w-8" />
            </Marker>
          )}

          {/* Anchor markers */}
          {validAnchors.map((anchor, i) => {
            const color = CATEGORY_COLORS[anchor.category] || DEFAULT_COLOR
            return (
              <Marker
                key={i}
                longitude={Number(anchor.lon)}
                latitude={Number(anchor.lat)}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  setSelected(anchor)
                  // Smoothly center the pin in the viewport
                  const map = mapRef.current
                  if (map) {
                    map.easeTo({
                      center: [Number(anchor.lon), Number(anchor.lat)],
                      duration: 300,
                    })
                  }
                }}
              >
                <PinSvg color={color} />
              </Marker>
            )
          })}

          {/* Popup for selected anchor */}
          {selected && (
            <Popup
              longitude={Number(selected.lon)}
              latitude={Number(selected.lat)}
              anchor="bottom"
              offset={24}
              closeOnClick={false}
              onClose={() => setSelected(null)}
            >
              <div className="text-xs space-y-1 max-w-[200px]">
                <div className="font-semibold text-gray-900">{selected.name}</div>
                {selected.category && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[selected.category] || DEFAULT_COLOR }}
                    />
                    <span className="text-gray-600">{formatCategory(selected.category)}</span>
                  </div>
                )}
                {selected.distance_m != null && (
                  <div className="text-gray-500">{selected.distance_m}m away</div>
                )}
                {selected.why_relevant && (
                  <div className="text-gray-500 italic">{selected.why_relevant}</div>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Legend */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-blue-600" />
            <span className="text-xs text-gray-500">Street location</span>
          </div>
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[cat] || DEFAULT_COLOR }}
              />
              <span className="text-xs text-gray-500">{formatCategory(cat)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
