import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Map, Marker, Popup } from '@vis.gl/react-maplibre'
import { Maximize2, Trash2, Loader2, Check } from 'lucide-react'
import {
  CATEGORY_CONFIG,
  DEFAULT_CONFIG,
  formatCategory,
  CategoryPin,
  StreetPin,
} from './StreetMaps'
import { calcDistance } from './streetDetailUtils'
import 'maplibre-gl/dist/maplibre-gl.css'

const WHY_RELEVANT = {
  supermarket: 'Major supermarket',
  flagship_retail: 'Major flagship retail store',
  airport: 'Airport nearby',
  health_club_branded: 'Premium health club / gym',
  health_club_generic: 'Health club / gym',
  health_club: 'Health club / gym',
  museum: 'Major cultural attraction',
  attraction: 'Major tourist destination',
  historic: 'Notable historic landmark',
  theatre: 'High-footfall entertainment venue',
  shopping: 'Large retail anchor',
  park: 'Major public space nearby',
  poi: 'Nearby point of interest',
  landmark: 'Notable landmark',
}

function parseAnchors(raw) {
  if (!raw) return []
  let items = raw
  if (typeof items === 'string') {
    try { items = JSON.parse(items) } catch { return [] }
  }
  return Array.isArray(items) ? items : []
}

export default function CustomAnchorsMap({ centerLat, centerLon, height = 400, initialAnchors, onSave, saving }) {
  const parsed = useMemo(() => parseAnchors(initialAnchors), [initialAnchors])
  const [customAnchors, setCustomAnchors] = useState(parsed)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editWhy, setEditWhy] = useState('')
  const mapRef = useRef(null)

  // Track if local state differs from saved data
  const isDirty = JSON.stringify(customAnchors) !== JSON.stringify(parsed)

  const hasCenter = centerLat != null && centerLon != null && !isNaN(centerLat) && !isNaN(centerLon)

  const handleLoad = useCallback((e) => {
    mapRef.current = e.target
  }, [])

  // --- HTML5 Drag & Drop: accept category icons dropped onto map ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const map = mapRef.current
    if (!map || !hasCenter) return

    const category = e.dataTransfer.getData('text/plain')
    if (!category || !CATEGORY_CONFIG[category]) return

    const rect = map.getContainer().getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const lngLat = map.unproject([x, y])

    const lat = lngLat.lat
    const lon = lngLat.lng
    const dist = calcDistance(centerLat, centerLon, lat, lon)
    const id = Date.now()

    const why_relevant = WHY_RELEVANT[category] || ''
    setCustomAnchors((prev) => [...prev, { id, name: '', category, lat, lon, distance_m: dist, why_relevant }])
    setEditingId(id)
    setEditName('')
    setEditWhy(why_relevant)

    // Smoothly center the dropped pin so the popup is fully visible
    map.easeTo({ center: [lon, lat], duration: 300 })
  }, [hasCenter, centerLat, centerLon])

  // --- Marker drag end: reposition + recalc distance ---
  const handleMarkerDragEnd = useCallback((anchor, evt) => {
    const lat = evt.lngLat.lat
    const lon = evt.lngLat.lng
    const dist = calcDistance(centerLat, centerLon, lat, lon)
    setCustomAnchors((prev) =>
      prev.map((a) => (a.id === anchor.id ? { ...a, lat, lon, distance_m: dist } : a))
    )
  }, [centerLat, centerLon])

  // --- Save name + why_relevant in popup ---
  const handleNameSave = useCallback(() => {
    if (editingId == null) return
    setCustomAnchors((prev) =>
      prev.map((a) => (a.id === editingId ? { ...a, name: editName, why_relevant: editWhy } : a))
    )
    setEditingId(null)
    setEditName('')
    setEditWhy('')
  }, [editingId, editName, editWhy])

  // --- Delete anchor ---
  const handleDelete = useCallback((id) => {
    setCustomAnchors((prev) => prev.filter((a) => a.id !== id))
    setEditingId(null)
    setEditName('')
    setEditWhy('')
  }, [])

  // --- Auto-save with debounce ---
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const parsedRef = useRef(parsed)
  parsedRef.current = parsed

  useEffect(() => {
    const isDirty = JSON.stringify(customAnchors) !== JSON.stringify(parsedRef.current)
    if (!isDirty || !onSaveRef.current) return
    const timer = setTimeout(() => {
      onSaveRef.current(customAnchors)
    }, 800)
    return () => clearTimeout(timer)
  }, [customAnchors])

  if (!hasCenter) {
    return (
      <div
        className="rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
        style={{ height }}
      >
        No street coordinates available
      </div>
    )
  }

  const editingAnchor = editingId != null ? customAnchors.find((a) => a.id === editingId) : null

  return (
    <div className="space-y-2">
      {/* Category toolbar — draggable icons */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        {Object.entries(CATEGORY_CONFIG).map(([cat]) => (
          <div
            key={cat}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', cat)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-full cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow select-none"
            title={`Drag to add ${formatCategory(cat)}`}
          >
            <CategoryPin category={cat} />
            <span className="text-xs text-gray-600">{formatCategory(cat)}</span>
          </div>
        ))}

        {/* Auto-save status indicator */}
        {saving && (
          <div className="flex items-center gap-1.5 ml-auto text-xs text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving...
          </div>
        )}
        {!saving && customAnchors.length > 0 && !isDirty && (
          <div className="flex items-center gap-1 ml-auto text-xs text-green-600">
            <Check className="h-3.5 w-3.5" />
            Saved
          </div>
        )}
      </div>

      {/* Map with drop zone */}
      <div
        className="rounded-lg overflow-hidden border border-gray-200 relative"
        style={{ height }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Hint overlay */}
        {customAnchors.length === 0 && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-500 shadow-sm">
              Drag a category icon onto the map to add an anchor
            </div>
          </div>
        )}

        {/* Reset zoom */}
        <button
          onClick={() => {
            const map = mapRef.current
            if (!map) return
            map.flyTo({ center: [Number(centerLon), Number(centerLat)], zoom: 15, duration: 300 })
          }}
          className="absolute top-2 right-2 z-10 bg-white rounded shadow-md p-1.5 hover:bg-gray-50 text-gray-600"
          title="Reset zoom"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        <Map
          initialViewState={{
            longitude: Number(centerLon),
            latitude: Number(centerLat),
            zoom: 15,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          attributionControl={false}
          onLoad={handleLoad}
        >
          {/* Street center pin */}
          <Marker
            longitude={Number(centerLon)}
            latitude={Number(centerLat)}
            anchor="bottom"
          >
            <StreetPin />
          </Marker>

          {/* Custom anchor markers — draggable */}
          {customAnchors.map((anchor) => (
            <Marker
              key={anchor.id}
              longitude={Number(anchor.lon)}
              latitude={Number(anchor.lat)}
              anchor="center"
              draggable
              onDragEnd={(evt) => handleMarkerDragEnd(anchor, evt)}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setEditingId(anchor.id)
                setEditName(anchor.name)
                setEditWhy(anchor.why_relevant || '')
                const map = mapRef.current
                if (map) {
                  map.easeTo({ center: [Number(anchor.lon), Number(anchor.lat)], duration: 300 })
                }
              }}
            >
              <CategoryPin category={anchor.category} />
            </Marker>
          ))}

          {/* Editing popup with name form */}
          {editingAnchor && (
            <Popup
              longitude={Number(editingAnchor.lon)}
              latitude={Number(editingAnchor.lat)}
              anchor="bottom"
              offset={18}
              onClose={() => { setEditingId(null); setEditName(''); setEditWhy('') }}
              className="custom-anchor-popup-dark"
            >
              <div className="text-xs space-y-2 min-w-[180px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: (CATEGORY_CONFIG[editingAnchor.category] || DEFAULT_CONFIG).color }}
                  />
                  <span className="text-gray-300 font-medium">{formatCategory(editingAnchor.category)}</span>
                </div>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave() }}
                  placeholder="Anchor name..."
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                  autoFocus
                />
                <input
                  type="text"
                  value={editWhy}
                  onChange={(e) => setEditWhy(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave() }}
                  placeholder="Why relevant..."
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                />
                <div className="text-gray-400">{editingAnchor.distance_m}m from street</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNameSave}
                    className="flex-1 bg-blue-600 text-white rounded px-2 py-1 text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDelete(editingAnchor.id)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                    title="Delete anchor"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  )
}
