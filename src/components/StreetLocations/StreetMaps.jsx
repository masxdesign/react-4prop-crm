import { useState, useRef, useCallback, useEffect } from 'react'
import { Map, Marker, Popup } from '@vis.gl/react-maplibre'
import {
  Building2,
  TreePine,
  Landmark,
  Store,
  ShoppingCart,
  Dumbbell,
  Drama,
  Plane,
  ShoppingBag,
  MapPinned,
  MapPin,
  Maximize2,
  TrainFront,
  Star,
  Castle,
} from 'lucide-react'
import CustomAnchorsMap from './CustomAnchorsMap'
import CoordinatePickerMap from '@/components/JobCore/components/CoordinatePickerMap'
import 'maplibre-gl/dist/maplibre-gl.css'

export const CATEGORY_CONFIG = {
  museum:               { color: '#8B5CF6', Icon: Building2 },
  park:                 { color: '#22C55E', Icon: TreePine },
  landmark:             { color: '#F59E0B', Icon: Landmark },
  flagship_retail:      { color: '#3B82F6', Icon: Store },
  supermarket:          { color: '#EF4444', Icon: ShoppingCart },
  health_club:          { color: '#EC4899', Icon: Dumbbell },
  health_club_branded:  { color: '#EC4899', Icon: Dumbbell },
  health_club_generic:  { color: '#EC4899', Icon: Dumbbell },
  theatre:              { color: '#F97316', Icon: Drama },
  airport:              { color: '#0EA5E9', Icon: Plane },
  shopping:             { color: '#A855F7', Icon: ShoppingBag },
  poi:                  { color: '#14B8A6', Icon: MapPinned },
  attraction:           { color: '#F59E0B', Icon: Star },
  historic:             { color: '#92400E', Icon: Castle },
}
export const DEFAULT_CONFIG = { color: '#6B7280', Icon: MapPin }

export const STATION_MODE_CONFIG = {
  tube:            { color: '#DC2626' },
  rail:            { color: '#1D4ED8' },
  overground:      { color: '#F97316' },
  dlr:             { color: '#00A4A7' },
  elizabeth_line:  { color: '#6B3FA0' },
  tram:            { color: '#84CC16' },
}
const DEFAULT_STATION_MODE = { color: '#6B7280' }

export function StationPin({ mode }) {
  const { color } = STATION_MODE_CONFIG[mode] || DEFAULT_STATION_MODE
  return (
    <div
      className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-md cursor-pointer"
      style={{ backgroundColor: color }}
    >
      <TrainFront className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
    </div>
  )
}

export function formatCategory(cat) {
  return cat
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function CategoryPin({ category }) {
  const { color, Icon } = CATEGORY_CONFIG[category] || DEFAULT_CONFIG
  return (
    <div
      className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-md cursor-pointer"
      style={{ backgroundColor: color }}
    >
      <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
    </div>
  )
}

export function StreetPin() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-8 w-8 text-blue-600 drop-shadow-lg"
    >
      <path
        fillRule="evenodd"
        d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function StationsMapView({ stations, centerLat, centerLon, hasCenter, height, defaultCenter }) {
  const [selected, setSelected] = useState(null)
  const mapRef = useRef(null)
  const initialBoundsRef = useRef(null)

  const fitToStations = useCallback((map, stationList) => {
    const points = stationList.map((s) => [Number(s.lon), Number(s.lat)])
    if (hasCenter) points.push([Number(centerLon), Number(centerLat)])
    if (points.length === 0) return

    if (points.length === 1) {
      initialBoundsRef.current = { center: points[0], zoom: 15 }
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

    const bounds = [[minLon, minLat], [maxLon, maxLat]]
    initialBoundsRef.current = { bounds }
    map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 300 })
  }, [hasCenter, centerLon, centerLat])

  const handleLoad = useCallback((e) => {
    mapRef.current = e.target
    fitToStations(e.target, stations)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fit bounds when stations data changes (e.g. after generation)
  useEffect(() => {
    if (mapRef.current && stations.length > 0) {
      fitToStations(mapRef.current, stations)
    }
  }, [stations, fitToStations])

  const resetZoom = useCallback(() => {
    const map = mapRef.current
    const saved = initialBoundsRef.current
    if (!map || !saved) return
    setSelected(null)
    if (saved.bounds) {
      map.fitBounds(saved.bounds, { padding: 50, maxZoom: 16, duration: 300 })
    } else {
      map.flyTo({ center: saved.center, zoom: saved.zoom, duration: 300 })
    }
  }, [])

  const modes = [...new Set(stations.map((s) => s.mode).filter(Boolean))]

  return (
    <>
      <div className="rounded-lg overflow-hidden border border-gray-200 relative" style={{ height }}>
        <button
          onClick={resetZoom}
          className="absolute top-2 right-2 z-10 bg-white rounded shadow-md p-1.5 hover:bg-gray-50 text-gray-600"
          title="Reset zoom"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <Map
          initialViewState={{
            longitude: defaultCenter.longitude,
            latitude: defaultCenter.latitude,
            zoom: 14,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          attributionControl={false}
          onLoad={handleLoad}
        >
          {hasCenter && (
            <Marker longitude={Number(centerLon)} latitude={Number(centerLat)} anchor="bottom">
              <StreetPin />
            </Marker>
          )}
          {stations.map((s, i) => (
            <Marker
              key={i}
              longitude={Number(s.lon)}
              latitude={Number(s.lat)}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelected(s)
                mapRef.current?.easeTo({ center: [Number(s.lon), Number(s.lat)], duration: 300 })
              }}
            >
              <StationPin mode={s.mode} />
            </Marker>
          ))}
          {selected && (
            <Popup
              longitude={Number(selected.lon)}
              latitude={Number(selected.lat)}
              anchor="bottom"
              offset={18}
              onClose={() => setSelected(null)}
              className="custom-anchor-popup-dark"
            >
              <div className="text-xs space-y-1 max-w-[200px]">
                {selected.mode && (
                  <div className="flex items-center gap-1.5 pr-4">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: (STATION_MODE_CONFIG[selected.mode] || DEFAULT_STATION_MODE).color }}
                    />
                    <span className="text-gray-300 font-medium">{formatCategory(selected.mode)}</span>
                  </div>
                )}
                <div className="font-semibold text-white">{selected.name}</div>
                {selected.distance_m != null && (
                  <div className="text-gray-400">{selected.distance_m}m from street</div>
                )}
                {selected.walk_time_min != null && (
                  <div className="text-gray-400">{selected.walk_time_min} min walk</div>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>
      {/* Legend */}
      <div className="space-y-1 px-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-blue-600">
              <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-500">Street location</span>
          </div>
          {modes.map((mode) => {
            const { color } = STATION_MODE_CONFIG[mode] || DEFAULT_STATION_MODE
            return (
              <div key={mode} className="flex items-center gap-1.5">
                <div
                  className="flex items-center justify-center w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: color }}
                >
                  <TrainFront className="h-2 w-2 text-white" strokeWidth={3} />
                </div>
                <span className="text-xs text-gray-500">{formatCategory(mode)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default function StreetMaps({ anchors, curatedNames, centerLat, centerLon, height = 400, customAnchorsData, onSaveCustomAnchors, savingCustomAnchors, coordValue, onCoordsSave, savingCoords, allAnchorsSlot, blogAnchorsSlot, generateButton, stations, generateStationsButton }) {
  const hasCenter = centerLat != null && centerLon != null && !isNaN(centerLat) && !isNaN(centerLon)
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState(hasCenter ? 'all' : 'editPin') // 'all' | 'blog' | 'custom' | 'stations' | 'editPin'
  const mapRef = useRef(null)

  // When the location changes, pick the most appropriate default tab
  useEffect(() => {
    const center = centerLat != null && centerLon != null && !isNaN(centerLat) && !isNaN(centerLon)
    if (!center) { setView('editPin'); return }
    // Parse anchors to check if any exist
    let parsed = anchors
    if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch { parsed = [] } }
    if (!Array.isArray(parsed) || parsed.length === 0) { setView('editPin'); return }
    setView('all')
  }, [centerLat, centerLon, anchors])
  const initialBoundsRef = useRef(null)

  // Parse stations if string
  let stationItems = stations
  if (typeof stationItems === 'string') {
    try { stationItems = JSON.parse(stationItems) } catch { stationItems = [] }
  }
  if (!Array.isArray(stationItems)) stationItems = []
  const validStations = stationItems.filter(
    (s) => s.lat != null && s.lon != null && !isNaN(s.lat) && !isNaN(s.lon)
  )

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
  const allAnchors = items.filter(
    (a) => a.lat != null && a.lon != null && !isNaN(a.lat) && !isNaN(a.lon)
  )

  // Build curated name set for filtering
  const curatedSet = curatedNames && curatedNames.length > 0
    ? new Set(curatedNames.map((n) => (typeof n === 'string' ? n : '').toLowerCase()))
    : null

  const hasCurated = curatedSet && allAnchors.some((a) => curatedSet.has(a.name?.toLowerCase()))
  const validAnchors = view === 'blog' && curatedSet
    ? allAnchors.filter((a) => curatedSet.has(a.name?.toLowerCase()))
    : allAnchors

  // Only fit bounds once on map load — not on re-renders
  const handleLoad = useCallback((e) => {
    const map = e.target
    mapRef.current = map

    const points = validAnchors.map((a) => [Number(a.lon), Number(a.lat)])
    if (hasCenter) points.push([Number(centerLon), Number(centerLat)])
    if (points.length === 0) return

    if (points.length === 1) {
      initialBoundsRef.current = { center: points[0], zoom: 15 }
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

    const bounds = [[minLon, minLat], [maxLon, maxLat]]
    initialBoundsRef.current = { bounds }
    map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 0 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetZoom = useCallback(() => {
    const map = mapRef.current
    const saved = initialBoundsRef.current
    if (!map || !saved) return
    setSelected(null)
    if (saved.bounds) {
      map.fitBounds(saved.bounds, { padding: 50, maxZoom: 16, duration: 300 })
    } else {
      map.flyTo({ center: saved.center, zoom: saved.zoom, duration: 300 })
    }
  }, [])

  if (validAnchors.length === 0 && view !== 'custom' && view !== 'stations' && view !== 'editPin') {
    return (
      <div className="space-y-2">
        {/* Tab bar — always show so user can reach other tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
            <button
              disabled={!hasCenter}
              onClick={() => { setView('all'); setSelected(null) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                !hasCenter ? 'text-gray-300 cursor-not-allowed' : view === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Anchors ({allAnchors.length})
            </button>
            {hasCurated && (
              <button
                disabled={!hasCenter}
                onClick={() => { setView('blog'); setSelected(null) }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  !hasCenter ? 'text-gray-300 cursor-not-allowed' : view === 'blog' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Blog Anchors ({allAnchors.filter((a) => curatedSet.has(a.name?.toLowerCase())).length})
              </button>
            )}
            <button
              disabled={!hasCenter}
              onClick={() => { setView('custom'); setSelected(null) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                !hasCenter ? 'text-gray-300 cursor-not-allowed' : view === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Custom Anchors
            </button>
            <button
              disabled={!hasCenter}
              onClick={() => { setView('stations'); setSelected(null) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                !hasCenter ? 'text-gray-300 cursor-not-allowed' : view === 'stations' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Stations ({validStations.length})
            </button>
            <button
              onClick={() => { setView('editPin'); setSelected(null) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                view === 'editPin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Edit Street Pin
            </button>
          </div>
          {hasCenter && <div className="flex gap-1">{generateButton}{generateStationsButton}</div>}
        </div>
        <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
          {hasCenter ? (
            <Map
              initialViewState={{
                longitude: Number(centerLon),
                latitude: Number(centerLat),
                zoom: 15,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="https://tiles.openfreemap.org/styles/liberty"
              attributionControl={false}
            >
              <Marker
                longitude={Number(centerLon)}
                latitude={Number(centerLat)}
                anchor="bottom"
              >
                <StreetPin />
              </Marker>
            </Map>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100">
              No street coordinates available
            </div>
          )}
        </div>
      </div>
    )
  }

  // Collect unique categories for legend
  const categories = [...new Set(validAnchors.map((a) => a.category).filter(Boolean))]

  const defaultCenter = hasCenter
    ? { longitude: Number(centerLon), latitude: Number(centerLat) }
    : validAnchors.length > 0
      ? { longitude: Number(validAnchors[0].lon), latitude: Number(validAnchors[0].lat) }
      : { longitude: -0.1278, latitude: 51.5074 }

  return (
    <div className="space-y-2">
      {/* Tab bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
          <button
            disabled={!hasCenter}
            onClick={() => { setView('all'); setSelected(null) }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              !hasCenter ? 'text-gray-300 cursor-not-allowed' : view === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Anchors ({allAnchors.length})
          </button>
          {hasCurated && (
            <button
              disabled={!hasCenter}
              onClick={() => { setView('blog'); setSelected(null) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                !hasCenter ? 'text-gray-300 cursor-not-allowed' : view === 'blog' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Blog Anchors ({allAnchors.filter((a) => curatedSet.has(a.name?.toLowerCase())).length})
            </button>
          )}
          <button
            disabled={!hasCenter}
            onClick={() => { setView('custom'); setSelected(null) }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              !hasCenter ? 'text-gray-300 cursor-not-allowed' : view === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Custom Anchors
          </button>
          <button
            disabled={!hasCenter}
            onClick={() => { setView('stations'); setSelected(null) }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              !hasCenter ? 'text-gray-300 cursor-not-allowed' : view === 'stations' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stations ({validStations.length})
          </button>
          <button
            onClick={() => { setView('editPin'); setSelected(null) }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'editPin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Edit Street Pin
          </button>
        </div>
        {hasCenter && <div className="flex gap-1">{generateButton}{generateStationsButton}</div>}
      </div>

      {/* Tab description */}
      <p className="text-sm text-gray-700 font-medium px-1">
        {view === 'editPin'
          ? 'Drag the map to reposition the street pin. Click Save on the yellow bar to confirm.'
          : view === 'custom'
            ? 'User-created anchors. Drag a category icon onto the map to add a pin. Click a pin to edit, drag to reposition.'
            : view === 'stations'
              ? 'Nearest transport stations. Click a pin for details.'
              : view === 'blog'
                ? 'Curated anchors selected for the blog article. Click a pin for details.'
                : 'AI-generated nearby points of interest. Click a pin for details.'}
      </p>

      {/* Edit Street Pin tab → CoordinatePickerMap */}
      {view === 'editPin' ? (
        <CoordinatePickerMap
          value={coordValue}
          onSave={onCoordsSave}
          disabled={savingCoords}
          height={height}
        />
      ) : view === 'custom' ? (
        <CustomAnchorsMap centerLat={centerLat} centerLon={centerLon} height={height} initialAnchors={customAnchorsData} onSave={onSaveCustomAnchors} saving={savingCustomAnchors} />
      ) : view === 'stations' ? (
        <StationsMapView
          stations={validStations}
          centerLat={centerLat}
          centerLon={centerLon}
          hasCenter={hasCenter}
          height={height}
          defaultCenter={defaultCenter}
        />
      ) : (
        <>
          <div className="rounded-lg overflow-hidden border border-gray-200 relative" style={{ height }}>
            <button
              onClick={resetZoom}
              className="absolute top-2 right-2 z-10 bg-white rounded shadow-md p-1.5 hover:bg-gray-50 text-gray-600"
              title="Reset zoom"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <Map
              initialViewState={{
                longitude: defaultCenter.longitude,
                latitude: defaultCenter.latitude,
                zoom: 15,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="https://tiles.openfreemap.org/styles/liberty"
              attributionControl={false}
              onLoad={handleLoad}
            >
              {/* Center pin — same as StreetLocationMap */}
              {hasCenter && (
                <Marker
                  longitude={Number(centerLon)}
                  latitude={Number(centerLat)}
                  anchor="bottom"
                >
                  <StreetPin />
                </Marker>
              )}

              {/* Anchor markers with category icons */}
              {validAnchors.map((anchor, i) => (
                <Marker
                  key={i}
                  longitude={Number(anchor.lon)}
                  latitude={Number(anchor.lat)}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    setSelected(anchor)
                    const map = mapRef.current
                    if (map) {
                      map.easeTo({
                        center: [Number(anchor.lon), Number(anchor.lat)],
                        duration: 300,
                      })
                    }
                  }}
                >
                  <CategoryPin category={anchor.category} />
                </Marker>
              ))}

              {/* Popup for selected anchor */}
              {selected && (
                <Popup
                  longitude={Number(selected.lon)}
                  latitude={Number(selected.lat)}
                  anchor="bottom"
                  offset={18}
                  onClose={() => setSelected(null)}
                  className="custom-anchor-popup-dark"
                >
                  <div className="text-xs space-y-1 max-w-[200px]">
                    {selected.category && (
                      <div className="flex items-center gap-1.5 pr-4">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: (CATEGORY_CONFIG[selected.category] || DEFAULT_CONFIG).color }}
                        />
                        <span className="text-gray-300 font-medium">{formatCategory(selected.category)}</span>
                      </div>
                    )}
                    <div className="font-semibold text-white">{selected.name}</div>
                    {selected.why_relevant && (
                      <div className="text-gray-400 italic">{selected.why_relevant}</div>
                    )}
                    {selected.distance_m != null && (
                      <div className="text-gray-400">{selected.distance_m}m from street</div>
                    )}
                  </div>
                </Popup>
              )}
            </Map>
          </div>

          {/* Legend */}
          <div className="space-y-1 px-1">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-blue-600">
                  <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-500">Street location</span>
              </div>
              {categories.map((cat) => {
                const { color, Icon } = CATEGORY_CONFIG[cat] || DEFAULT_CONFIG
                return (
                  <div key={cat} className="flex items-center gap-1.5">
                    <div
                      className="flex items-center justify-center w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="h-2 w-2 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs text-gray-500">{formatCategory(cat)}</span>
                  </div>
                )
              })}
            </div>
          </div>
          {view === 'blog' ? blogAnchorsSlot : allAnchorsSlot}
        </>
      )}
    </div>
  )
}
