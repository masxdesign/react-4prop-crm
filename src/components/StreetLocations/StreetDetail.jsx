import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, ChevronDown, Loader2, CheckCircle2, Circle, AlertCircle, Pencil, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import CoordinatePickerMap from '@/components/JobCore/components/CoordinatePickerMap'
import KeyAnchorsMap from '@/components/StreetLocations/KeyAnchorsMap'
import { streetLocationDetailQuery, streetLocationsByPrefixQuery } from '@/features/streetLocations/streetLocations.queries'
import { updateStreetLocationCoordinates, updateStreetLocationFields, updateStreetLocationCustomAnchors } from '@/services/streetLocationService'
import { usePhaseGeneration } from '@/hooks/use-PhaseGeneration'
import ReactMarkdownPrimitive from 'react-markdown'
import remarkGfm from 'remark-gfm'

function parseDate(value) {
  if (!value) return null
  // If it's a number or numeric string, treat as Unix timestamp
  const num = Number(value)
  if (!isNaN(num) && num > 0) {
    // If less than 1e12, it's seconds — convert to ms
    const ms = num < 1e12 ? num * 1000 : num
    const d = new Date(ms)
    if (!isNaN(d.getTime())) return d
  }
  // Try parsing as ISO/date string
  const d = new Date(value)
  if (!isNaN(d.getTime())) return d
  return null
}

function formatCompletedDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PhaseStatus({ completedAt }) {
  if (completedAt) {
    const date = parseDate(completedAt)
    return (
      <CheckCircle2
        className="h-4 w-4 text-green-500 shrink-0"
        title={date ? `Completed ${formatCompletedDate(date)}` : 'Completed'}
      />
    )
  }
  return (
    <Circle className="h-4 w-4 text-gray-300 shrink-0" />
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

function EditableDetailRow({ label, value, onSave, saving }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)

  const handleSave = () => {
    const newValue = inputRef.current?.value?.trim() ?? ''
    setEditing(false)
    if (newValue !== (value ?? '')) {
      onSave(newValue)
    }
  }

  if (editing) {
    return (
      <div className="space-y-0.5 border-b border-gray-100 py-2">
        <div className="text-sm text-gray-400">{label}</div>
        <Input
          ref={inputRef}
          defaultValue={value ?? ''}
          autoFocus
          className="h-8 text-base w-full"
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setEditing(false)
          }}
          disabled={saving}
        />
      </div>
    )
  }

  return (
    <div
      className="space-y-0.5 border-b border-gray-100 py-2 group cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
      onClick={() => setEditing(true)}
    >
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-base text-gray-900 flex items-center gap-1">
        {value || '—'}
        <Pencil className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
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

function MarkdownPreviewBox({ label, content }) {
  const [expanded, setExpanded] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    if (!expanded) return
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setExpanded(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [expanded])

  if (!content) {
    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-400">{label}</div>
        <span className="text-sm text-gray-400">—</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-400">{label}</div>
      <div
        ref={boxRef}
        className={`relative rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-all duration-300 ${expanded ? '' : 'max-h-32 overflow-hidden'}`}
        onClick={() => {
          setExpanded((v) => {
            if (!v) {
              setTimeout(() => boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
            }
            return !v
          })
        }}
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

function PhaseGenerateButton({ phase, streetLocationId, disabledReason, completedAt, onGeneratingChange }) {
  const { generate, checkStatus, statusMap, isGenerating } = usePhaseGeneration(phase)

  useEffect(() => {
    if (streetLocationId) {
      checkStatus([streetLocationId])
    }
  }, [streetLocationId, checkStatus])

  const isPending = statusMap.get(streetLocationId) === 'pending'
  const busy = isGenerating || isPending

  useEffect(() => {
    onGeneratingChange?.(busy)
  }, [busy, onGeneratingChange])

  const blocked = !!disabledReason
  const label = completedAt ? 'Regenerate' : 'Generate'

  return (
    <Button
      size="sm"
      disabled={busy || blocked}
      onClick={(e) => { e.stopPropagation(); generate([streetLocationId]) }}
      title={blocked ? disabledReason : undefined}
      className="h-7 text-xs gap-1 shrink-0 border-0 cursor-pointer bg-linear-to-br from-blue-500 via-sky-500 to-teal-400 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-shadow"
    >
      {busy ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3" />
          {label}
        </>
      )}
    </Button>
  )
}

function CollapsiblePhaseCard({ title, phase, completedAt, streetLocationId, defaultOpen = true, disabledReason, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const [isBusy, setIsBusy] = useState(false)

  return (
    <Card className="group/card">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2 px-4 py-3">
          <CollapsibleTrigger asChild>
            <button type="button" className="flex items-center gap-2 flex-1 min-w-0 group cursor-pointer">
              <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
              <PhaseStatus completedAt={completedAt} />
              <h3 className="font-semibold text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{title}</h3>
            </button>
          </CollapsibleTrigger>
          {phase && <div className={isBusy ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100 transition-opacity'}><PhaseGenerateButton phase={phase} streetLocationId={streetLocationId} disabledReason={disabledReason} completedAt={completedAt} onGeneratingChange={setIsBusy} /></div>}
        </div>
        <CollapsibleContent>
          <CardContent className="pt-2 space-y-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default function StreetDetail({ prefix, streetLocationId, filter }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [showCoordSheet, setShowCoordSheet] = useState(false)
  const { data: location, isLoading, error } = useQuery(
    streetLocationDetailQuery(streetLocationId)
  )
  const { data: allStreets } = useQuery(streetLocationsByPrefixQuery(prefix))

  const { prevStreet, nextStreet, currentIndex, totalCount } = useMemo(() => {
    if (!allStreets || !Array.isArray(allStreets)) return {}
    const idx = allStreets.findIndex((s) => String(s.id) === String(streetLocationId))
    if (idx === -1) return { totalCount: allStreets.length }
    return {
      prevStreet: idx > 0 ? allStreets[idx - 1] : null,
      nextStreet: idx < allStreets.length - 1 ? allStreets[idx + 1] : null,
      currentIndex: idx,
      totalCount: allStreets.length,
    }
  }, [allStreets, streetLocationId])

  const goToStreet = useCallback((id) => {
    navigate({
      to: '/admin/street-locations/$prefix/$streetLocationId',
      params: { prefix, streetLocationId: String(id) },
      search: filter ? { filter } : {},
    })
  }, [navigate, prefix, filter])

  const goBack = useCallback(() => {
    navigate({
      to: '/admin/street-locations/$prefix',
      params: { prefix },
      search: filter ? { filter } : {},
    })
  }, [navigate, prefix, filter])

  // Format lat/lon as "lat,lon" string for CoordinatePickerMap
  const coordValue = useMemo(() => {
    if (location?.lat != null && location?.lon != null) {
      return `${location.lat},${location.lon}`
    }
    return ''
  }, [location?.lat, location?.lon])

  const fieldsMutation = useMutation({
    mutationFn: (fields) => updateStreetLocationFields(streetLocationId, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streetLocations'] })
    },
  })

  const handleFieldSave = useCallback((field, value) => {
    fieldsMutation.mutate({ [field]: value })
  }, [fieldsMutation])

  const coordsMutation = useMutation({
    mutationFn: ({ lat, lon }) => updateStreetLocationCoordinates(streetLocationId, lat, lon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streetLocations'] })
    },
  })

  const customAnchorsMutation = useMutation({
    mutationFn: (anchors) => updateStreetLocationCustomAnchors(streetLocationId, anchors),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streetLocations'] })
    },
  })

  const handleCoordsSave = useCallback((coordString) => {
    const parts = coordString.split(',').map(s => s.trim())
    const lat = parseFloat(parts[0])
    const lon = parseFloat(parts[1])
    if (!isNaN(lat) && !isNaN(lon)) {
      coordsMutation.mutate({ lat, lon })
    }
  }, [coordsMutation])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading street details...</span>
      </div>
    )
  }

  if (error) {
    return <p className="p-6 text-red-600">Failed to load: {error.message}</p>
  }

  if (!location) {
    return <p className="p-6 text-gray-600">Street location not found.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="text-gray-600 hover:text-gray-900 -ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {prefix} Streets
        </Button>

        {totalCount > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!prevStreet}
              onClick={() => goToStreet(prevStreet.id)}
              className="h-7 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-xs text-gray-500 px-1">{currentIndex + 1} / {totalCount}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!nextStreet}
              onClick={() => goToStreet(nextStreet.id)}
              className="h-7 px-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{location.street}</h1>
        <p className="text-sm text-gray-500">{location.postcode} — {location.suburb || location.borough || prefix}</p>
      </div>

      {location.last_error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="break-all">{location.last_error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Location info (1/3) */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-sm">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 px-4 pb-3">
              <DetailRow label="ID" value={location.id} />
              <DetailRow label="Prefix" value={location.prefix} />
              <EditableDetailRow label="Postcode" value={location.postcode} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('postcode', v)} />
              <EditableDetailRow label="Street" value={location.street} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('street', v)} />
              <EditableDetailRow label="Suburb" value={location.suburb} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('suburb', v)} />
              <EditableDetailRow label="Neighbourhood" value={location.neighbourhood} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('neighbourhood', v)} />
              <EditableDetailRow label="Borough" value={location.borough} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('borough', v)} />
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-sm text-gray-500 shrink-0">Coordinates</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowCoordSheet(true)}
                >
                  Edit
                </Button>
              </div>
              <DetailRow label="Radius" value={location.radius != null ? `${location.radius}m` : null} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Pipeline phases (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Nearby Phase */}
          <CollapsiblePhaseCard title="Nearby" phase="nearby" completedAt={location.nearby_completed_at} streetLocationId={location.id}>
            <Accordion type="multiple" defaultValue={[]}>
              <AccordionItem value="stations">
                <AccordionTrigger className="py-2 text-sm text-gray-500">Nearest Stations</AccordionTrigger>
                <AccordionContent>
                  <NearestStationsTable value={location.nearest_stations} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <KeyAnchorsMap
              anchors={location.key_anchors}
              curatedNames={(() => {
                try {
                  const d = typeof location.curated_nearby === 'string' ? JSON.parse(location.curated_nearby) : location.curated_nearby
                  return Array.isArray(d?.curated_anchors) ? d.curated_anchors : null
                } catch { return null }
              })()}
              centerLat={location.lat}
              centerLon={location.lon}
              height={420}
              customAnchorsData={location.custom_anchors}
              onSaveCustomAnchors={(anchors) => customAnchorsMutation.mutate(anchors)}
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
          </CollapsiblePhaseCard>

          {/* SEO Phase */}
          <CollapsiblePhaseCard title="SEO" phase="seo" completedAt={location.seo_completed_at} streetLocationId={location.id} defaultOpen={false}>
            {/* Short fields in 2-col grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <DetailRow label="Seed Tone Type" value={location.seed_tone_type} />
              <DetailRow label="Search Intent" value={location.search_intent} />
              <DetailRow label="Writing Style" value={location.writing_style} />
              <DetailRow label="Writing Tone" value={location.writing_tone} />
              <DetailRow label="Seed Keyword" value={location.seed_keyword} />
              <DetailRow label="Primary Keyword" value={location.keywords_primary_keyword} />
            </div>

            {/* Full-width text fields in tabs */}
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

            {/* Keywords & Analysis tabs */}
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
          </CollapsiblePhaseCard>

          {/* Pre-Blog Phase */}
          <CollapsiblePhaseCard title="Pre-Blog" phase="pre-blog" completedAt={location.pre_blog_completed_at} streetLocationId={location.id} defaultOpen={false} disabledReason={!location.seo_completed_at ? 'Requires SEO to be completed first' : undefined}>
            <DetailRow label="New Title" value={location.new_title} />
            <MarkdownPreviewBox label="Key Takeaways" content={location.key_takeaways} />
            <MarkdownPreviewBox label="Outline" content={location.outline} />
          </CollapsiblePhaseCard>

          {/* Post-Blog Phase */}
          <CollapsiblePhaseCard title="Post-Blog" phase="post-blog" completedAt={location.post_blog_completed_at} streetLocationId={location.id} disabledReason={(() => {
            const missing = [
              !location.nearby_completed_at && 'Nearby',
              !location.seo_completed_at && 'SEO',
              !location.pre_blog_completed_at && 'Pre-Blog',
            ].filter(Boolean)
            return missing.length > 0 ? `Requires ${missing.join(', ')} to be completed first` : undefined
          })()}>
            <MarkdownPreviewBox label="Draft Markdown" content={location.draft_markdown} />
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
          </CollapsiblePhaseCard>

          {/* Image Phase */}
          <CollapsiblePhaseCard title="Image" completedAt={location.image_completed_at}>
            {location.featured_image_url ? (
              <a
                href={`https://api.4prop.com/uploads/blog-posts/${location.featured_image_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={`https://api.4prop.com/uploads/blog-posts/${location.featured_image_url}`}
                  alt={`${location.street} featured`}
                  className="rounded border max-h-48 object-cover"
                />
              </a>
            ) : (
              <span className="text-sm text-gray-400">No image</span>
            )}
          </CollapsiblePhaseCard>

          {/* Publish Phase */}
          <CollapsiblePhaseCard title="Publish" completedAt={location.publish_completed_at}>
            <DetailRow label="Blog Post ID" value={location.blog_post_id} />
            <DetailRow
              label="Last Updated"
              value={parseDate(location.publish_updated_at)?.toLocaleString()}
            />
          </CollapsiblePhaseCard>
        </div>
      </div>

      <Sheet open={showCoordSheet} onOpenChange={setShowCoordSheet}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{location.street}</SheetTitle>
            <SheetDescription>{location.postcode} — {location.suburb || location.borough || prefix}</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500">
              Drag the map to move the pin to the correct location. When you release, click Save on the yellow bar to confirm, or Cancel to revert.
            </p>
            {showCoordSheet && (
              <CoordinatePickerMap
                value={coordValue}
                onSave={(val) => { handleCoordsSave(val); setShowCoordSheet(false) }}
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
    </div>
  )
}
