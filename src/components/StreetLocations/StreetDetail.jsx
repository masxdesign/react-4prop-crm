import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ChevronLeft, Loader2, CheckCircle2, Circle, AlertCircle, Pencil, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import CoordinatePickerMap from '@/components/JobCore/components/CoordinatePickerMap'
import KeyAnchorsMap from '@/components/StreetLocations/KeyAnchorsMap'
import { streetLocationDetailQuery } from '@/features/streetLocations/streetLocations.queries'
import { updateStreetLocationCoordinates, updateStreetLocationFields } from '@/services/streetLocationService'
import { useNearbyGeneration } from '@/hooks/use-NearbyGeneration'

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
      <div className="flex justify-between gap-4 text-sm border-b border-gray-100 pb-2">
        <span className="text-gray-500 shrink-0">{label}</span>
        <Input
          ref={inputRef}
          defaultValue={value ?? ''}
          autoFocus
          className="h-7 text-sm text-right w-48"
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
      className="flex justify-between gap-4 text-sm border-b border-gray-100 pb-2 group cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
      onClick={() => setEditing(true)}
    >
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right break-all flex items-center gap-1">
        {value || '—'}
        <Pencil className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </span>
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

function NearbyGenerateSection({ streetLocationId, children }) {
  const { generate, checkStatus, statusMap, isGenerating, isPolling } = useNearbyGeneration()

  useEffect(() => {
    if (streetLocationId) {
      checkStatus([streetLocationId])
    }
  }, [streetLocationId, checkStatus])

  const status = statusMap.get(streetLocationId)
  const isPending = status === 'pending'

  return (
    <div className="space-y-2 mt-3 border-t pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">Blog Anchors</span>
        <Button
          size="sm"
          variant="outline"
          disabled={isGenerating || isPending}
          onClick={() => generate([streetLocationId])}
          className="h-7 text-xs gap-1"
        >
          {isGenerating || isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Generate
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-400">AI-generated street profile and featured anchors picked from the full list for the blog post.</p>
      {children}
    </div>
  )
}

function PhaseSection({ title, completedAt, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
        <PhaseStatus completedAt={completedAt} />
      </div>
      <div className="space-y-2 pl-2">
        {children}
      </div>
    </div>
  )
}

export default function StreetDetail({ prefix, streetLocationId }) {
  const queryClient = useQueryClient()
  const [showCoordSheet, setShowCoordSheet] = useState(false)
  const { data: location, isLoading, error } = useQuery(
    streetLocationDetailQuery(streetLocationId)
  )

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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="text-gray-600 hover:text-gray-900 -ml-2"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to {prefix} Streets
      </Button>

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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DetailRow label="ID" value={location.id} />
              <DetailRow label="Prefix" value={location.prefix} />
              <EditableDetailRow label="Postcode" value={location.postcode} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('postcode', v)} />
              <EditableDetailRow label="Street" value={location.street} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('street', v)} />
              <EditableDetailRow label="Suburb" value={location.suburb} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('suburb', v)} />
              <EditableDetailRow label="Neighbourhood" value={location.neighbourhood} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('neighbourhood', v)} />
              <EditableDetailRow label="Borough" value={location.borough} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('borough', v)} />
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-500 shrink-0 w-32">Coordinates</span>
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
          <Card>
            <CardContent className="pt-6 space-y-4">
              <PhaseSection title="Nearby" completedAt={location.nearby_completed_at}>
                <Accordion type="multiple" defaultValue={[]}>
                  <AccordionItem value="stations">
                    <AccordionTrigger className="py-2 text-sm text-gray-500">Nearest Stations</AccordionTrigger>
                    <AccordionContent>
                      <NearestStationsTable value={location.nearest_stations} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <NearbyGenerateSection streetLocationId={location.id}>
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
                    height={350}
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
                </NearbyGenerateSection>
              </PhaseSection>
            </CardContent>
          </Card>

          {/* SEO Phase */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <PhaseSection title="SEO" completedAt={location.seo_completed_at}>
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
              </PhaseSection>
            </CardContent>
          </Card>

          {/* Pre-Blog Phase */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <PhaseSection title="Pre-Blog" completedAt={location.pre_blog_completed_at}>
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
              </PhaseSection>
            </CardContent>
          </Card>

          {/* Post-Blog Phase */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <PhaseSection title="Post-Blog" completedAt={location.post_blog_completed_at}>
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
              </PhaseSection>
            </CardContent>
          </Card>

          {/* Image Phase */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <PhaseSection title="Image" completedAt={location.image_completed_at}>
                {location.featured_image_url ? (
                  <a
                    href={location.featured_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={location.featured_image_url}
                      alt={`${location.street} featured`}
                      className="rounded border max-h-48 object-cover"
                    />
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">No image</span>
                )}
              </PhaseSection>
            </CardContent>
          </Card>

          {/* Publish Phase */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <PhaseSection title="Publish" completedAt={location.publish_completed_at}>
                <DetailRow label="Blog Post ID" value={location.blog_post_id} />
                <DetailRow
                  label="Last Updated"
                  value={parseDate(location.publish_updated_at)?.toLocaleString()}
                />
              </PhaseSection>
            </CardContent>
          </Card>
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
