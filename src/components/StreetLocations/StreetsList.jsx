import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ChevronLeft, Loader2, Search, CheckCircle2, Circle, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Trash2, Sparkles, RefreshCw, PlusCircle } from 'lucide-react'
import { parseDate } from './streetDetailUtils'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import CoordinatePickerMap from '@/components/JobCore/components/CoordinatePickerMap'
import StreetMaps from '@/components/StreetLocations/StreetMaps'
import { CursorInfoCard } from '@/components/ui-custom/CursorInfoCard'
import { useCursorInfoCard } from '@/hooks/use-CursorInfoCard'
import { Label } from '@/components/ui/label'
import { streetLocationsByPrefixQuery, streetLocationDetailQuery } from '@/features/streetLocations/streetLocations.queries'
import { updateStreetLocationCoordinates, deleteStreetLocation, updateStreetLocationCustomAnchors, addStreetLocation } from '@/services/streetLocationService'
import { usePhaseGeneration } from '@/hooks/use-PhaseGeneration'
import { useStreetLocationStatus } from '@/hooks/use-BulkPhaseStatus'
import ReactMarkdownPrimitive from 'react-markdown'
import remarkGfm from 'remark-gfm'

const PHASES = [
  { key: 'key_anchors_completed_at', label: 'Key Anchors' },
  { key: 'nearest_stations_completed_at', label: 'Nearest Stations' },
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

const mdComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mt-3 mb-1.5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-gray-800 mt-2 mb-1">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold text-gray-800 mt-2 mb-1">{children}</h4>,
  p: ({ children }) => <p className="text-sm text-gray-700 mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-0.5 text-sm text-gray-700">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5 text-sm text-gray-700">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  a: ({ children, ...props }) => <a {...props} className="underline text-blue-600" target="_blank" rel="noreferrer">{children}</a>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-600 my-2">{children}</blockquote>,
  table: ({ children }) => <table className="text-sm border-collapse w-full my-2">{children}</table>,
  th: ({ children }) => <th className="border border-gray-200 px-2 py-1 bg-gray-50 text-left font-medium text-gray-700">{children}</th>,
  td: ({ children }) => <td className="border border-gray-200 px-2 py-1 text-gray-700">{children}</td>,
}

function needsNearbyRegen(street) {
  if (!street.key_anchors_completed_at) return true
  if (!street.curated_nearby) return false
  try {
    const d = typeof street.curated_nearby === 'string'
      ? JSON.parse(street.curated_nearby)
      : street.curated_nearby
    if (!d || typeof d !== 'object') return false
    // Old format has editorial_summary or removed fields
    if (d.editorial_summary) return true
    if (Array.isArray(d.removed) && d.removed.length > 0) return true
    // Old format has object-type curated_anchors items
    if (Array.isArray(d.curated_anchors) && d.curated_anchors.length > 0 && typeof d.curated_anchors[0] === 'object') return true
    return false
  } catch {
    return false
  }
}

function MarkdownBox({ label, content }) {
  const [expanded, setExpanded] = useState(false)

  if (!content) {
    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-500">{label}</div>
        <span className="text-sm text-gray-400">—</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-500">{label}</div>
      <div
        className={`relative rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-all duration-300 ${expanded ? '' : 'max-h-32 overflow-hidden'}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="p-3 max-w-prose">
          <ReactMarkdownPrimitive components={mdComponents} remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdownPrimitive>
        </div>
        {!expanded && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white to-transparent rounded-b-lg pointer-events-none" />
        )}
      </div>
    </div>
  )
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
    <div className="space-y-0.5 border-b border-gray-100 py-2">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-base text-gray-900 max-w-prose">{value ?? '—'}</div>
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
          <div key={i} className="text-sm bg-gray-50 rounded px-2 py-1.5">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ))}
      </div>
    )
  } catch {
    return <span className="text-sm text-gray-500 break-all">{String(value)}</span>
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

const STREET_PROFILE_FIELDS = [
  { key: 'footfall_signal', label: 'Footfall Signal' },
  { key: 'retail_mix', label: 'Retail Mix' },
  { key: 'evening_economy', label: 'Evening Economy' },
  { key: 'connectivity', label: 'Connectivity' },
  { key: 'blog_angle', label: 'Blog Angle' },
]

function CuratedNearbyDisplay({ value, showTitle = true }) {
  if (!value) return null
  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value
    if (!data || typeof data !== 'object') return null
    return (
      <div className="space-y-3">
        {showTitle && <div className="text-sm text-gray-500 font-medium">Featured Anchors</div>}
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
            {typeof data.street_profile === 'object' ? (
              <div className="space-y-1.5 bg-gray-50 rounded p-2">
                {STREET_PROFILE_FIELDS.map(({ key, label }) =>
                  data.street_profile[key] ? (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500">{label}:</span>{' '}
                      <span className="text-gray-900">{data.street_profile[key]}</span>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2">
                {String(data.street_profile)}
              </div>
            )}
          </div>
        )}
        {data.curated_anchors && Array.isArray(data.curated_anchors) && data.curated_anchors.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Featured Anchors</div>
            <div className="flex flex-wrap gap-1">
              {data.curated_anchors.map((anchor, i) => (
                <span key={i} className="text-xs bg-gray-100 rounded px-2 py-0.5">
                  {typeof anchor === 'object' ? JSON.stringify(anchor) : anchor}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.removed && Array.isArray(data.removed) && data.removed.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Removed</div>
            <div className="flex flex-wrap gap-1">
              {data.removed.map((item, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-600 rounded px-2 py-0.5">
                  {typeof item === 'object' ? JSON.stringify(item) : item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch {
    return <span className="text-xs text-gray-500 break-all">{String(value)}</span>
  }
}

function PhaseGenerateSection({ phase, label, streetLocationId, completedAt, disabledReason, children }) {
  const { generate, isGenerating } = usePhaseGeneration(phase)
  const blocked = !!disabledReason
  const btnLabel = completedAt ? 'Regenerate' : 'Generate'

  return (
    <div className="space-y-2 mt-3 border-t pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <Button
          size="sm"
          disabled={isGenerating || blocked}
          onClick={() => generate([streetLocationId])}
          title={blocked ? disabledReason : undefined}
          className="h-7 text-xs gap-1 shrink-0 border-0 cursor-pointer bg-linear-to-br from-blue-500 via-sky-500 to-teal-400 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-shadow"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              {btnLabel}
            </>
          )}
        </Button>
      </div>
      {children}
    </div>
  )
}

function PhaseSheetContent({ streetId, phaseKey }) {
  const queryClient = useQueryClient()
  const { data: location, isLoading } = useQuery(streetLocationDetailQuery(streetId))
  const customAnchorsMutation = useMutation({
    mutationFn: ({ id, anchors }) => updateStreetLocationCustomAnchors(id, anchors),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streetLocations'] })
    },
  })

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

      {phaseKey === 'key_anchors_completed_at' && (
        <PhaseGenerateSection phase="key-anchors" label="Key Anchors" streetLocationId={location.id} completedAt={location.key_anchors_completed_at}>
          <StreetMaps
            anchors={location.key_anchors}
            curatedNames={(() => {
              try {
                const d = typeof location.curated_nearby === 'string' ? JSON.parse(location.curated_nearby) : location.curated_nearby
                return Array.isArray(d?.curated_anchors) ? d.curated_anchors : null
              } catch { return null }
            })()}
            centerLat={location.lat}
            centerLon={location.lon}
            height={360}
            customAnchorsData={location.custom_anchors}
            onSaveCustomAnchors={(anchors) => customAnchorsMutation.mutate({ id: location.id, anchors })}
            savingCustomAnchors={customAnchorsMutation.isPending}
          />
          <Accordion type="multiple" defaultValue={[]}>
            <AccordionItem value="anchors">
              <AccordionTrigger className="py-2 text-sm text-gray-500">Raw Anchor Data</AccordionTrigger>
              <AccordionContent>
                <JsonArrayDisplay value={location.key_anchors} />
              </AccordionContent>
            </AccordionItem>
            {location.curated_nearby && (
              <AccordionItem value="curated">
                <AccordionTrigger className="py-2 text-sm text-gray-500">Featured Anchors</AccordionTrigger>
                <AccordionContent>
                  <CuratedNearbyDisplay value={location.curated_nearby} showTitle={false} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </PhaseGenerateSection>
      )}

      {phaseKey === 'nearest_stations_completed_at' && (
        <PhaseGenerateSection phase="nearest-stations" label="Nearest Stations" streetLocationId={location.id} completedAt={location.nearest_stations_completed_at}>
          <NearestStationsTable value={location.nearest_stations} />
        </PhaseGenerateSection>
      )}

      {phaseKey === 'seo_completed_at' && (
        <>
          <PhaseGenerateSection phase="seo" label="SEO Research" streetLocationId={location.id} completedAt={location.seo_completed_at}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <DetailRow label="Seed Tone Type" value={location.seed_tone_type} />
                <DetailRow label="Search Intent" value={location.search_intent} />
                <DetailRow label="Writing Style" value={location.writing_style} />
                <DetailRow label="Writing Tone" value={location.writing_tone} />
                <DetailRow label="Seed Keyword" value={location.seed_keyword} />
                <DetailRow label="Primary Keyword" value={location.keywords_primary_keyword} />
              </div>

              <DetailRow label="Seed Title" value={location.seed_title} />
              <Tabs defaultValue="target-audience">
                <TabsList className="h-8 w-full justify-start">
                  <TabsTrigger value="target-audience" className="text-xs px-2.5 py-1 h-6">Target Audience</TabsTrigger>
                  <TabsTrigger value="goal" className="text-xs px-2.5 py-1 h-6">Goal of Article</TabsTrigger>
                  <TabsTrigger value="insight" className="text-xs px-2.5 py-1 h-6">Hidden Insight</TabsTrigger>
                </TabsList>
                <TabsContent value="target-audience">
                  <div className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2 max-w-prose">
                    {location.target_audience || '—'}
                  </div>
                </TabsContent>
                <TabsContent value="goal">
                  <div className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2 max-w-prose">
                    {location.goal_of_article || '—'}
                  </div>
                </TabsContent>
                <TabsContent value="insight">
                  <div className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2 max-w-prose">
                    {location.hidden_insight || '—'}
                  </div>
                </TabsContent>
              </Tabs>

              <Tabs defaultValue="secondary">
                <TabsList className="h-8 w-full justify-start">
                  <TabsTrigger value="secondary" className="text-xs px-2.5 py-1 h-6">Secondary</TabsTrigger>
                  <TabsTrigger value="semantic" className="text-xs px-2.5 py-1 h-6">Semantic</TabsTrigger>
                  <TabsTrigger value="longtail" className="text-xs px-2.5 py-1 h-6">Long Tail</TabsTrigger>
                  <TabsTrigger value="subtopics" className="text-xs px-2.5 py-1 h-6">Subtopics</TabsTrigger>
                  <TabsTrigger value="questions" className="text-xs px-2.5 py-1 h-6">Questions</TabsTrigger>
                </TabsList>
                <TabsContent value="secondary">
                  <JsonArrayDisplay value={location.keywords_secondary_keywords} />
                </TabsContent>
                <TabsContent value="semantic">
                  <JsonArrayDisplay value={location.keywords_semantic_keywords} />
                </TabsContent>
                <TabsContent value="longtail">
                  <JsonArrayDisplay value={location.keywords_long_tail_keywords} />
                </TabsContent>
                <TabsContent value="subtopics">
                  <JsonArrayDisplay value={location.semantic_analysis_common_subtopics} />
                </TabsContent>
                <TabsContent value="questions">
                  <JsonArrayDisplay value={location.semantic_analysis_related_questions} />
                </TabsContent>
              </Tabs>
            </div>
          </PhaseGenerateSection>
        </>
      )}

      {phaseKey === 'pre_blog_completed_at' && (
        <>
          <PhaseGenerateSection phase="pre-blog" label="Pre-Blog Research" streetLocationId={location.id} completedAt={location.pre_blog_completed_at} disabledReason={!location.seo_completed_at ? 'Requires SEO to be completed first' : undefined}>
            <div className="space-y-2">
              <DetailRow label="New Title" value={location.new_title} />
              <MarkdownBox label="Key Takeaways" content={location.key_takeaways} />
              <MarkdownBox label="Outline" content={location.outline} />
            </div>
          </PhaseGenerateSection>
        </>
      )}

      {phaseKey === 'post_blog_completed_at' && (
        <>
          <PhaseGenerateSection phase="post-blog" label="Post-Blog Generation" streetLocationId={location.id} completedAt={location.post_blog_completed_at} disabledReason={(() => {
            const missing = [
              !location.key_anchors_completed_at && 'Key Anchors',
              !location.nearest_stations_completed_at && 'Nearest Stations',
              !location.seo_completed_at && 'SEO',
              !location.pre_blog_completed_at && 'Pre-Blog',
            ].filter(Boolean)
            return missing.length > 0 ? `Requires ${missing.join(', ')} to be completed first` : undefined
          })()}>
            <div className="space-y-2">
              <MarkdownBox label="Draft Markdown" content={location.draft_markdown} />
            </div>
          </PhaseGenerateSection>
        </>
      )}

      {phaseKey === 'image_completed_at' && (
        <>
          <div>
            {location.featured_image_url ? (
              <a href={`https://api.4prop.com/uploads/blog-posts/${location.featured_image_url}`} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={`https://api.4prop.com/uploads/blog-posts/${location.featured_image_url}`}
                  alt={`${location.street} featured`}
                  className="rounded border max-h-48 object-cover"
                />
              </a>
            ) : (
              <span className="text-sm text-gray-400">No image</span>
            )}
          </div>
          <PhaseGenerateSection phase="image" label="Image Generation" streetLocationId={location.id} completedAt={location.image_completed_at} disabledReason={!location.post_blog_completed_at ? 'Requires Post-Blog to be completed first' : undefined} />
        </>
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
  const [showAddStreet, setShowAddStreet] = useState(false)
  const [nearbyFilter, setNearbyFilter] = useState(() => localStorage.getItem('streetLocations.nearbyFilter') === 'true')

  const addStreetForm = useForm({ defaultValues: { postcode: '', street: '', suburb: '', neighbourhood: '', borough: '' } })

  const addStreetMutation = useMutation({
    mutationFn: (input) => addStreetLocation(input),
    onSuccess: (newStreet) => {
      queryClient.invalidateQueries({ queryKey: ['streetLocations'] })
      setShowAddStreet(false)
      addStreetForm.reset()
      if (newStreet?.prefix && newStreet.prefix !== prefix) {
        navigate({
          to: '/admin/street-locations/$prefix',
          params: { prefix: newStreet.prefix },
        })
      }
    },
  })
  const cursorCard = useCursorInfoCard({ showDelay: 0 })

  const allIds = useMemo(() => streets?.map(s => s.id) ?? [], [streets])
  const { statusMap, markPending } = useStreetLocationStatus(allIds, undefined, 'list')

  const keyAnchors = usePhaseGeneration('key-anchors')
  const nearestStations = usePhaseGeneration('nearest-stations')
  const seo = usePhaseGeneration('seo')
  const preBlog = usePhaseGeneration('pre-blog')
  const postBlog = usePhaseGeneration('post-blog')
  const image = usePhaseGeneration('image')

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
    if (!streets) return streets
    let result = streets
    if (filter.trim()) {
      const q = filter.toLowerCase()
      result = result.filter(s =>
        s.street?.toLowerCase().includes(q) ||
        s.postcode?.toLowerCase().includes(q) ||
        s.suburb?.toLowerCase().includes(q)
      )
    }
    if (nearbyFilter) {
      result = result.filter(needsNearbyRegen)
    }
    return result
  }, [streets, filter, nearbyFilter])

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

  const customAnchorsMutation = useMutation({
    mutationFn: ({ id, anchors }) => updateStreetLocationCustomAnchors(id, anchors),
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
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-3 md:px-6 pt-3 md:pt-4 pb-2 space-y-2 border-b bg-white">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/admin/street-locations' })}
            className="text-gray-600 hover:text-gray-900 -ml-2 h-7"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Regions
          </Button>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold text-gray-900">{regionName}</h1>
          <span className="text-xs text-gray-500">({streets?.length ?? 0} streets)</span>
          <Button
            size="sm"
            onClick={() => setShowAddStreet(true)}
            className="ml-auto h-7 text-xs gap-1"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Street
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filter by street, postcode or suburb..."
            defaultValue={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={nearbyFilter ? 'default' : 'outline'}
          size="sm"
          onClick={() => setNearbyFilter(v => { const next = !v; localStorage.setItem('streetLocations.nearbyFilter', next); return next })}
          className="gap-1 whitespace-nowrap"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Needs Nearby
          {nearbyFilter && streets && (
            <span className="ml-1 text-xs opacity-80">
              ({streets.filter(needsNearbyRegen).length})
            </span>
          )}
        </Button>
        {selectedIds.size > 0 && (
          <>
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {selectedIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={keyAnchors.isGenerating}
              onClick={() => { const ids = [...selectedIds]; keyAnchors.generate(ids); markPending(ids, 'key-anchors') }}
            >
              {keyAnchors.isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate Key Anchors
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={nearestStations.isGenerating}
              onClick={() => { const ids = [...selectedIds]; nearestStations.generate(ids); markPending(ids, 'nearest-stations') }}
            >
              {nearestStations.isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate Nearest Stations
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={seo.isGenerating}
              onClick={() => { const ids = [...selectedIds]; seo.generate(ids); markPending(ids, 'seo') }}
            >
              {seo.isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate SEO
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={preBlog.isGenerating}
              onClick={() => { const ids = [...selectedIds]; preBlog.generate(ids); markPending(ids, 'pre-blog') }}
            >
              {preBlog.isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate Pre-Blog
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={postBlog.isGenerating}
              onClick={() => { const ids = [...selectedIds]; postBlog.generate(ids); markPending(ids, 'post-blog') }}
            >
              {postBlog.isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate Post-Blog
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={image.isGenerating}
              onClick={() => { const ids = [...selectedIds]; image.generate(ids); markPending(ids, 'image') }}
            >
              {image.isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate Image
                </>
              )}
            </Button>
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
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-3 md:px-6 pb-3 md:pb-6">
      <Table containerClassName="overflow-visible" className="min-w-[800px]">
        <TableHeader className="sticky top-0 z-5 [&_th]:bg-white">
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
            <TableHead className="w-24">Status</TableHead>
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
                  search: filter ? { filter } : {},
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
              <TableCell>
                {statusMap.has(street.id) && (
                  <div className="flex flex-col gap-1">
                    {[...statusMap.get(street.id).entries()].map(([phase]) => {
                      const phaseColors = {
                        'key-anchors': 'text-yellow-600 border-yellow-300',
                        'nearest-stations': 'text-orange-600 border-orange-300',
                        'seo': 'text-blue-600 border-blue-300',
                        'pre-blog': 'text-purple-600 border-purple-300',
                        'post-blog': 'text-emerald-600 border-emerald-300',
                        'image': 'text-pink-600 border-pink-300',
                      }
                      const phaseLabels = {
                        'key-anchors': 'Key Anchors',
                        'nearest-stations': 'Nearest Stations',
                        'seo': 'SEO',
                        'pre-blog': 'Pre-Blog',
                        'post-blog': 'Post-Blog',
                        'image': 'Image',
                      }
                      return (
                        <Badge key={phase} variant="outline" className={`gap-1 text-xs ${phaseColors[phase] ?? 'text-gray-600 border-gray-300'}`}>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {phaseLabels[phase] ?? phase}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

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

      <Dialog open={showAddStreet} onOpenChange={(open) => { setShowAddStreet(open); if (!open) addStreetForm.reset() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Street</DialogTitle>
            <DialogDescription>
              Use the outward/district code for postcode (e.g. SE1, E1W). The prefix is derived automatically.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={addStreetForm.handleSubmit((values) => addStreetMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-postcode">Postcode <span className="text-red-500">*</span></Label>
                <Input
                  id="add-postcode"
                  placeholder="e.g. SE1"
                  {...addStreetForm.register('postcode', { required: true })}
                />
                {addStreetForm.formState.errors.postcode && (
                  <p className="text-xs text-red-600">Postcode is required</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-suburb">Suburb</Label>
                <Input
                  id="add-suburb"
                  placeholder="e.g. Borough"
                  {...addStreetForm.register('suburb')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-street">Street <span className="text-red-500">*</span></Label>
              <Input
                id="add-street"
                placeholder="e.g. Borough High Street"
                {...addStreetForm.register('street', { required: true })}
              />
              {addStreetForm.formState.errors.street && (
                <p className="text-xs text-red-600">Street name is required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-neighbourhood">Neighbourhood</Label>
              <Input
                id="add-neighbourhood"
                placeholder="e.g. Bermondsey"
                {...addStreetForm.register('neighbourhood')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-borough">Borough</Label>
              <Input
                id="add-borough"
                placeholder="e.g. London Borough of Southwark"
                {...addStreetForm.register('borough')}
              />
            </div>
            {addStreetMutation.isError && (
              <p className="text-sm text-red-600">
                Failed to add street: {addStreetMutation.error?.message}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowAddStreet(false); addStreetForm.reset() }}
                disabled={addStreetMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addStreetMutation.isPending}>
                {addStreetMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Street'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
