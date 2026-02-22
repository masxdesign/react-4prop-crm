import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ChevronLeft, Loader2, Search, CheckCircle2, Circle, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import CoordinatePickerMap from '@/components/JobCore/components/CoordinatePickerMap'
import { CursorInfoCard } from '@/components/ui-custom/CursorInfoCard'
import { useCursorInfoCard } from '@/hooks/use-CursorInfoCard'
import { streetLocationsByPrefixQuery, streetLocationDetailQuery } from '@/features/streetLocations/streetLocations.queries'
import { updateStreetLocationCoordinates, deleteStreetLocation } from '@/services/streetLocationService'

const PHASES = [
  { key: 'nearby_completed_at', label: 'Nearby' },
  { key: 'seo_completed_at', label: 'SEO' },
  { key: 'pre_blog_completed_at', label: 'Pre-Blog' },
  { key: 'post_blog_completed_at', label: 'Post-Blog' },
  { key: 'image_completed_at', label: 'Image' },
  { key: 'publish_completed_at', label: 'Publish' },
]

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

function parseDate(value) {
  if (!value) return null
  const num = Number(value)
  if (!isNaN(num) && num > 0) {
    const ms = num < 1e12 ? num * 1000 : num
    const d = new Date(ms)
    if (!isNaN(d.getTime())) return d
  }
  const d = new Date(value)
  if (!isNaN(d.getTime())) return d
  return null
}

function PhaseStatus({ completedAt }) {
  if (completedAt) {
    const date = parseDate(completedAt)
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle2 className="h-3 w-3 text-green-600" />
        {date ? date.toLocaleString() : 'Completed'}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 text-gray-400">
      <Circle className="h-3 w-3" />
      Pending
    </Badge>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm border-b border-gray-100 pb-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right break-all">{value ?? '—'}</span>
    </div>
  )
}

function JsonArrayDisplay({ value }) {
  if (!value) return <span className="text-gray-400">—</span>
  try {
    const arr = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(arr) || arr.length === 0) return <span className="text-gray-400">—</span>
    return (
      <div className="space-y-1">
        {arr.map((item, i) => (
          <div key={i} className="text-xs bg-gray-50 rounded px-2 py-1">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ))}
      </div>
    )
  } catch {
    return <span className="text-xs text-gray-500 break-all">{String(value)}</span>
  }
}

function NearestStationsTable({ value }) {
  if (!value) return <span className="text-gray-400">—</span>
  try {
    const stations = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(stations) || stations.length === 0) return <span className="text-gray-400">—</span>
    return (
      <div className="text-xs space-y-1">
        {stations.map((s, i) => (
          <div key={i} className="bg-gray-50 rounded px-2 py-1">
            <span className="font-medium">{s.name}</span>
            {s.mode && <span className="text-gray-500 ml-1">({s.mode})</span>}
            {s.distance_m != null && <span className="text-gray-500 ml-1">— {s.distance_m}m</span>}
            {s.walk_time_min != null && <span className="text-gray-500 ml-1">({s.walk_time_min} min walk)</span>}
          </div>
        ))}
      </div>
    )
  } catch {
    return <span className="text-xs text-gray-500 break-all">{String(value)}</span>
  }
}

function CuratedNearbyDisplay({ value, showTitle = true }) {
  if (!value) return null
  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value
    if (!data || typeof data !== 'object') return null
    return (
      <div className="space-y-3">
        {showTitle && <div className="text-sm text-gray-500 font-medium">Curated Nearby</div>}
        {data.editorial_summary && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Editorial Summary</div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2">
              {data.editorial_summary}
            </div>
          </div>
        )}
        {data.street_profile && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Street Profile</div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2">
              {typeof data.street_profile === 'object' ? JSON.stringify(data.street_profile, null, 2) : data.street_profile}
            </div>
          </div>
        )}
        {data.curated_anchors && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Curated Anchors</div>
            <JsonArrayDisplay value={data.curated_anchors} />
          </div>
        )}
        {data.removed && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Removed</div>
            <JsonArrayDisplay value={data.removed} />
          </div>
        )}
      </div>
    )
  } catch {
    return <span className="text-xs text-gray-500 break-all">{String(value)}</span>
  }
}

function PhaseSheetContent({ streetId, phaseKey }) {
  const { data: location, isLoading } = useQuery(streetLocationDetailQuery(streetId))

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading phase data...</span>
      </div>
    )
  }

  if (!location) return <p className="text-sm text-gray-500">No data available.</p>

  return (
    <div className="space-y-4">
      <PhaseStatus completedAt={location[phaseKey]} />

      {phaseKey === 'nearby_completed_at' && (
        <Accordion type="multiple" defaultValue={[]}>
          <AccordionItem value="stations">
            <AccordionTrigger className="py-2 text-sm text-gray-500">Nearest Stations</AccordionTrigger>
            <AccordionContent>
              <NearestStationsTable value={location.nearest_stations} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="anchors">
            <AccordionTrigger className="py-2 text-sm text-gray-500">Key Anchors</AccordionTrigger>
            <AccordionContent>
              <JsonArrayDisplay value={location.key_anchors} />
            </AccordionContent>
          </AccordionItem>
          {location.curated_nearby && (
            <AccordionItem value="curated">
              <AccordionTrigger className="py-2 text-sm text-gray-500">Curated Nearby</AccordionTrigger>
              <AccordionContent>
                <CuratedNearbyDisplay value={location.curated_nearby} showTitle={false} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      {phaseKey === 'seo_completed_at' && (
        <div className="space-y-2">
          <DetailRow label="Seed Tone Type" value={location.seed_tone_type} />
          <DetailRow label="Seed Title" value={location.seed_title} />
          <DetailRow label="Seed Keyword" value={location.seed_keyword} />
          <DetailRow label="Search Intent" value={location.search_intent} />
          <DetailRow label="Writing Style" value={location.writing_style} />
          <DetailRow label="Writing Tone" value={location.writing_tone} />
          <DetailRow label="Hidden Insight" value={location.hidden_insight} />
          <DetailRow label="Target Audience" value={location.target_audience} />
          <DetailRow label="Goal of Article" value={location.goal_of_article} />
          <DetailRow label="Primary Keyword" value={location.keywords_primary_keyword} />
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Secondary Keywords</div>
            <JsonArrayDisplay value={location.keywords_secondary_keywords} />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Semantic Keywords</div>
            <JsonArrayDisplay value={location.keywords_semantic_keywords} />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Long Tail Keywords</div>
            <JsonArrayDisplay value={location.keywords_long_tail_keywords} />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Common Subtopics</div>
            <JsonArrayDisplay value={location.semantic_analysis_common_subtopics} />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Related Questions</div>
            <JsonArrayDisplay value={location.semantic_analysis_related_questions} />
          </div>
        </div>
      )}

      {phaseKey === 'pre_blog_completed_at' && (
        <div className="space-y-2">
          <DetailRow label="New Title" value={location.new_title} />
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Key Takeaways</div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2">
              {location.key_takeaways || '—'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Outline</div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2 max-h-60 overflow-auto">
              {location.outline || '—'}
            </div>
          </div>
        </div>
      )}

      {phaseKey === 'post_blog_completed_at' && (
        <div className="space-y-2">
          <DetailRow label="Google Doc ID" value={location.google_doc_article_id} />
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Draft Markdown</div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2 max-h-60 overflow-auto">
              {location.draft_markdown
                ? location.draft_markdown.length > 500
                  ? location.draft_markdown.slice(0, 500) + '...'
                  : location.draft_markdown
                : '—'}
            </div>
          </div>
          {location.nearest_stations_table_md && (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Stations Table (MD)</div>
              <div className="text-xs text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2 max-h-40 overflow-auto">
                {location.nearest_stations_table_md}
              </div>
            </div>
          )}
          {location.key_anchors_table_md && (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Key Anchors Table (MD)</div>
              <div className="text-xs text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2 max-h-40 overflow-auto">
                {location.key_anchors_table_md}
              </div>
            </div>
          )}
        </div>
      )}

      {phaseKey === 'image_completed_at' && (
        <div>
          {location.featured_image_url ? (
            <a href={location.featured_image_url} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={location.featured_image_url}
                alt={`${location.street} featured`}
                className="rounded border max-h-48 object-cover"
              />
            </a>
          ) : (
            <span className="text-sm text-gray-400">No image</span>
          )}
        </div>
      )}

      {phaseKey === 'publish_completed_at' && (
        <div className="space-y-2">
          <DetailRow label="Blog Post ID" value={location.blog_post_id} />
          <DetailRow
            label="Last Updated"
            value={parseDate(location.publish_updated_at)?.toLocaleString()}
          />
        </div>
      )}
    </div>
  )
}

export default function StreetsList({ prefix, filter = '' }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: streets, isLoading, error } = useQuery(
    streetLocationsByPrefixQuery(prefix)
  )
  const [editingStreet, setEditingStreet] = useState(null)
  const [phaseSheet, setPhaseSheet] = useState(null)
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('streetLocations.sortBy') || null)
  const [sortDir, setSortDir] = useState(() => localStorage.getItem('streetLocations.sortDir') || 'asc')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const cursorCard = useCursorInfoCard({ showDelay: 0 })

  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      const newDir = sortDir === 'asc' ? 'desc' : 'asc'
      setSortDir(newDir)
      localStorage.setItem('streetLocations.sortDir', newDir)
    } else {
      setSortBy(column)
      setSortDir('asc')
      localStorage.setItem('streetLocations.sortBy', column)
      localStorage.setItem('streetLocations.sortDir', 'asc')
    }
  }, [sortBy, sortDir])

  const setFilter = useCallback((value) => {
    navigate({
      to: '/admin/street-locations/$prefix',
      params: { prefix },
      search: value ? { filter: value } : {},
      replace: true,
    })
  }, [navigate, prefix])

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filteredStreets = useMemo(() => {
    if (!streets || !filter.trim()) return streets
    const q = filter.toLowerCase()
    return streets.filter(s =>
      s.street?.toLowerCase().includes(q) ||
      s.postcode?.toLowerCase().includes(q) ||
      s.suburb?.toLowerCase().includes(q)
    )
  }, [streets, filter])

  const sortedStreets = useMemo(() => {
    if (!filteredStreets || !sortBy) return filteredStreets
    const dir = sortDir === 'asc' ? 1 : -1
    const compare = sortBy === 'postcode'
      ? (a, b) => (a ?? '').localeCompare(b ?? '', undefined, { numeric: true, sensitivity: 'base' })
      : (a, b) => {
        const aVal = (a ?? '').toLowerCase()
        const bVal = (b ?? '').toLowerCase()
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      }
    return [...filteredStreets].sort((a, b) => dir * compare(a[sortBy], b[sortBy]))
  }, [filteredStreets, sortBy, sortDir])

  const toggleSelectAll = useCallback(() => {
    if (!sortedStreets) return
    const visibleIds = sortedStreets.map(s => s.id)
    setSelectedIds(prev => {
      const allSelected = visibleIds.length > 0 && visibleIds.every(id => prev.has(id))
      if (allSelected) return new Set()
      return new Set(visibleIds)
    })
  }, [sortedStreets])

  const allSelected = sortedStreets?.length > 0 && sortedStreets.every(s => selectedIds.has(s.id))
  const someSelected = sortedStreets?.some(s => selectedIds.has(s.id)) && !allSelected

  const coordValue = useMemo(() => {
    if (editingStreet?.lat != null && editingStreet?.lon != null) {
      return `${editingStreet.lat},${editingStreet.lon}`
    }
    return ''
  }, [editingStreet?.lat, editingStreet?.lon])

  const coordsMutation = useMutation({
    mutationFn: ({ id, lat, lon }) => updateStreetLocationCoordinates(id, lat, lon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streetLocations'] })
      setEditingStreet(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStreetLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streetLocations'] })
    },
  })

  const handleDeleteSelected = useCallback(async () => {
    const ids = [...selectedIds]
    for (const id of ids) {
      await deleteMutation.mutateAsync(id)
    }
    setSelectedIds(new Set())
    setShowDeleteConfirm(false)
  }, [selectedIds, deleteMutation])

  const handleCoordsSave = useCallback((coordString) => {
    if (!editingStreet) return
    const parts = coordString.split(',').map(s => s.trim())
    const lat = parseFloat(parts[0])
    const lon = parseFloat(parts[1])
    if (!isNaN(lat) && !isNaN(lon)) {
      coordsMutation.mutate({ id: editingStreet.id, lat, lon })
    }
  }, [editingStreet, coordsMutation])

  const regionName = REGIONS[prefix] || prefix

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading streets...</span>
      </div>
    )
  }

  if (error) {
    return <p className="p-6 text-red-600">Failed to load streets: {error.message}</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/admin/street-locations' })}
          className="text-gray-600 hover:text-gray-900 -ml-2 mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Regions
        </Button>

        <h1 className="text-2xl font-bold text-gray-900">{regionName}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {streets?.length ?? 0} streets in {prefix}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filter by street, postcode or suburb..."
            defaultValue={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        {selectedIds.size > 0 && (
          <>
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {selectedIds.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-16">ID</TableHead>
            {[
              { key: 'street', label: 'Street' },
              { key: 'postcode', label: 'Postcode' },
              { key: 'suburb', label: 'Suburb' },
            ].map(col => (
              <TableHead
                key={col.key}
                className="cursor-pointer select-none hover:bg-gray-50"
                onClick={() => handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortBy === col.key
                    ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)
                    : <ArrowUpDown className="h-3 w-3 text-gray-300" />
                  }
                </span>
              </TableHead>
            ))}
            <TableHead>Coordinates</TableHead>
            <TableHead>Pipeline</TableHead>
            <TableHead className="w-10">Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStreets?.map((street) => (
            <TableRow
              key={street.id}
              className="cursor-pointer"
              onClick={() =>
                navigate({
                  to: '/admin/street-locations/$prefix/$streetLocationId',
                  params: { prefix, streetLocationId: String(street.id) },
                })
              }
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(street.id)}
                  onCheckedChange={() => toggleSelect(street.id)}
                />
              </TableCell>
              <TableCell className="text-xs text-gray-400">{street.id}</TableCell>
              <TableCell className="font-medium">{street.street}</TableCell>
              <TableCell>{street.postcode}</TableCell>
              <TableCell>{street.suburb || '—'}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingStreet(street)
                  }}
                >
                  Edit
                </Button>
              </TableCell>
              <TableCell>
                {(() => {
                  const completed = PHASES.filter(p => street[p.key]).length
                  return (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {PHASES.map(p => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              cursorCard.hide()
                              setPhaseSheet({
                                streetId: street.id,
                                streetName: street.street,
                                postcode: street.postcode,
                                suburb: street.suburb,
                                phaseKey: p.key,
                                phaseLabel: p.label,
                              })
                            }}
                            onMouseEnter={() => cursorCard.show(`${p.label}: ${street[p.key] ? 'Done' : 'Pending'}`)}
                            onMouseMove={cursorCard.updatePosition}
                            onMouseLeave={cursorCard.hide}
                            className={`inline-block h-5 w-5 rounded-full cursor-pointer transition-transform hover:scale-125 ${
                              street[p.key]
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{completed}/{PHASES.length}</span>
                    </div>
                  )
                })()}
              </TableCell>
              <TableCell>
                {street.last_error && (
                  <div
                    onMouseEnter={() => cursorCard.show(street.last_error)}
                    onMouseMove={cursorCard.updatePosition}
                    onMouseLeave={cursorCard.hide}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CursorInfoCard visible={cursorCard.state.visible} x={cursorCard.state.x} y={cursorCard.state.y}>
        {cursorCard.state.content}
      </CursorInfoCard>

      <Sheet open={!!phaseSheet} onOpenChange={(open) => !open && setPhaseSheet(null)}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          {phaseSheet && (
            <>
              <SheetHeader>
                <SheetTitle>{phaseSheet.phaseLabel} — {phaseSheet.streetName}</SheetTitle>
                <SheetDescription>{phaseSheet.postcode} — {phaseSheet.suburb || prefix}</SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <PhaseSheetContent streetId={phaseSheet.streetId} phaseKey={phaseSheet.phaseKey} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!editingStreet} onOpenChange={(open) => !open && setEditingStreet(null)}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingStreet?.street}</SheetTitle>
            <SheetDescription>{editingStreet?.postcode} — {editingStreet?.suburb || prefix}</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500">
              Drag the map to move the pin to the correct location. When you release, click Save on the yellow bar to confirm the new coordinates, or Cancel to revert.
            </p>
            {editingStreet && (
              <CoordinatePickerMap
                value={coordValue}
                onSave={handleCoordsSave}
                disabled={coordsMutation.isPending}
                height={400}
              />
            )}
            {coordsMutation.isError && (
              <p className="text-sm text-red-600 mt-2">
                Failed to save: {coordsMutation.error?.message}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} street location{selectedIds.size !== 1 ? 's' : ''}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected street location{selectedIds.size !== 1 ? 's' : ''} and all associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          {deleteMutation.isError && (
            <p className="text-sm text-red-600">
              Failed to delete: {deleteMutation.error?.message}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
