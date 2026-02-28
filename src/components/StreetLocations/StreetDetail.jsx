import { useMemo, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import StreetMaps from '@/components/StreetLocations/StreetMaps'
import { streetLocationDetailQuery, streetLocationsByPrefixQuery } from '@/features/streetLocations/streetLocations.queries'
import { updateStreetLocationCoordinates, updateStreetLocationFields, updateStreetLocationCustomAnchors } from '@/services/streetLocationService'
import { parseDate, recalcAnchorDistances } from './streetDetailUtils'
import { DetailRow, EditableDetailRow } from './DetailComponents'
import { JsonArrayDisplay, MarkdownPreviewBox, NearestStationsTable, CuratedNearbyDisplay } from './DataDisplay'
import { PhaseGenerateButton, CollapsiblePhaseCard } from './PhaseComponents'
import PipelineChecklist, { hasContent } from './PipelineChecklist'
import { useStreetLocationStatus } from '@/hooks/use-BulkPhaseStatus'

export default function StreetDetail({ prefix, streetLocationId, filter }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: location, isLoading, error } = useQuery(
    streetLocationDetailQuery(streetLocationId)
  )
  const { data: allStreets } = useQuery(streetLocationsByPrefixQuery(prefix))

  const detailIds = useMemo(() => [streetLocationId], [streetLocationId])
  const { statusMap, markPending } = useStreetLocationStatus(detailIds, useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['streetLocations', 'detail', streetLocationId] })
  }, [queryClient, streetLocationId]))

  const handleGenerate = useCallback((phase, id) => {
    markPending([id], phase)
  }, [markPending])

  const isPhaseRunning = useCallback((phase) =>
    statusMap.get(Number(streetLocationId))?.has(phase) ?? false
  , [statusMap, streetLocationId])

  // Apply the same filtering and sorting as StreetsList so prev/next order matches
  const { prevStreet, nextStreet, currentIndex, totalCount } = useMemo(() => {
    if (!allStreets || !Array.isArray(allStreets)) return {}

    // Filter — same logic as StreetsList
    let list = allStreets
    if (filter?.trim()) {
      const q = filter.toLowerCase()
      list = list.filter(s =>
        s.street?.toLowerCase().includes(q) ||
        s.postcode?.toLowerCase().includes(q) ||
        s.suburb?.toLowerCase().includes(q)
      )
    }

    // Sort — read persisted sort state from localStorage
    const sortBy = localStorage.getItem('streetLocations.sortBy')
    const sortDir = localStorage.getItem('streetLocations.sortDir') || 'asc'
    if (sortBy) {
      const dir = sortDir === 'asc' ? 1 : -1
      const compare = sortBy === 'postcode'
        ? (a, b) => (a ?? '').localeCompare(b ?? '', undefined, { numeric: true, sensitivity: 'base' })
        : (a, b) => {
          const aVal = (a ?? '').toLowerCase()
          const bVal = (b ?? '').toLowerCase()
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        }
      list = [...list].sort((a, b) => dir * compare(a[sortBy], b[sortBy]))
    }

    const idx = list.findIndex((s) => String(s.id) === String(streetLocationId))
    if (idx === -1) return { totalCount: list.length }
    return {
      prevStreet: idx > 0 ? list[idx - 1] : null,
      nextStreet: idx < list.length - 1 ? list[idx + 1] : null,
      currentIndex: idx,
      totalCount: list.length,
    }
  }, [allStreets, streetLocationId, filter])

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

      // Recalculate distances for existing anchors
      const updatedKeyAnchors = recalcAnchorDistances(location?.key_anchors, lat, lon)
      if (updatedKeyAnchors) {
        fieldsMutation.mutate({ key_anchors: JSON.stringify(updatedKeyAnchors) })
      }

      const updatedCustomAnchors = recalcAnchorDistances(location?.custom_anchors, lat, lon)
      if (updatedCustomAnchors) {
        customAnchorsMutation.mutate(updatedCustomAnchors)
      }
    }
  }, [coordsMutation, fieldsMutation, customAnchorsMutation, location?.key_anchors, location?.custom_anchors])

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

  const missingFields = [
    !location.postcode && 'Postcode',
    !location.street && 'Street',
    !(location.lat != null && location.lon != null) && 'Coordinates',
  ].filter(Boolean)
  const missingFieldsReason = missingFields.length > 0
    ? `Requires ${missingFields.join(', ')} to be set first`
    : undefined

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
        {/* Left: Checklist + Location info (1/3) */}
        <div className="lg:col-span-1 space-y-4">
          <PipelineChecklist location={location} missingFieldsReason={missingFieldsReason} onGenerate={handleGenerate} isRunning={isPhaseRunning} />
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-sm">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 px-4 pb-3">
              <DetailRow label="ID" value={location.id} />
              <DetailRow label="Prefix" value={location.prefix} />
              <EditableDetailRow label="Postcode" value={location.postcode} saving={fieldsMutation.isPending} onSave={(v) => {
                const upper = v.toUpperCase()
                // Extract prefix — leading alphabetical characters (e.g. SE1 → SE, E1 → E, W2 → W)
                const newPrefix = upper.match(/^[A-Z]+/)?.[0] || ''
                const fields = { postcode: upper }
                if (newPrefix && newPrefix !== location.prefix) {
                  fields.prefix = newPrefix
                }
                fieldsMutation.mutate(fields)
              }} />
              <EditableDetailRow label="Street" value={location.street} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('street', v)} />
              <EditableDetailRow label="Suburb" value={location.suburb} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('suburb', v)} />
              <EditableDetailRow label="Neighbourhood" value={location.neighbourhood} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('neighbourhood', v)} />
              <EditableDetailRow label="Borough" value={location.borough} saving={fieldsMutation.isPending} onSave={(v) => handleFieldSave('borough', v)} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Pipeline phases (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Street Maps */}
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
            height={420}
            customAnchorsData={location.custom_anchors}
            onSaveCustomAnchors={(anchors) => customAnchorsMutation.mutate(anchors)}
            savingCustomAnchors={customAnchorsMutation.isPending}
            coordValue={coordValue}
            onCoordsSave={handleCoordsSave}
            savingCoords={coordsMutation.isPending}
            stations={location.nearest_stations}
            generateButton={
              <PhaseGenerateButton
                phase="key-anchors"
                streetLocationId={location.id}
                completedAt={location.key_anchors && location.curated_nearby ? true : null}
                suffix="Key Anchors"
                disabledReason={missingFieldsReason}
                onGenerate={handleGenerate}
                isRunning={isPhaseRunning('key-anchors')}
              />
            }
            generateStationsButton={
              <PhaseGenerateButton
                phase="nearest-stations"
                streetLocationId={location.id}
                completedAt={location.nearest_stations_completed_at}
                suffix="Stations"
                disabledReason={missingFieldsReason}
                onGenerate={handleGenerate}
                isRunning={isPhaseRunning('nearest-stations')}
              />
            }
            allAnchorsSlot={
              <Accordion type="multiple" defaultValue={[]}>
                <AccordionItem value="anchors">
                  <AccordionTrigger className="py-2 text-sm text-gray-500">Raw Anchor Data</AccordionTrigger>
                  <AccordionContent>
                    <JsonArrayDisplay value={location.key_anchors} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            }
            blogAnchorsSlot={location.curated_nearby && (
              <Accordion type="multiple" defaultValue={[]}>
                <AccordionItem value="curated">
                  <AccordionTrigger className="py-2 text-sm text-gray-500">Featured Anchors</AccordionTrigger>
                  <AccordionContent>
                    <CuratedNearbyDisplay value={location.curated_nearby} showTitle={false} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          />

          {/* Nearest Stations */}
          <CollapsiblePhaseCard title="Nearest Stations" phase="nearest-stations" completedAt={location.nearest_stations_completed_at} streetLocationId={location.id} disabledReason={missingFieldsReason} onGenerate={handleGenerate} isRunning={isPhaseRunning('nearest-stations')}>
            <NearestStationsTable value={location.nearest_stations} />
          </CollapsiblePhaseCard>

          {/* SEO Phase */}
          <CollapsiblePhaseCard title="SEO" phase="seo" completedAt={location.seo_completed_at} streetLocationId={location.id} defaultOpen={false} disabledReason={missingFieldsReason} onGenerate={handleGenerate} isRunning={isPhaseRunning('seo')}>
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

          {/* Image Phase */}
          <CollapsiblePhaseCard title="Image" phase="image" completedAt={location.image_completed_at} streetLocationId={location.id} disabledReason={(() => {
            const missing = [
              !(location.lat != null && location.lon != null) && 'Coordinates',
              !location.key_anchors && 'Key Anchors',
              !location.curated_nearby && 'Featured Anchors',
            ].filter(Boolean)
            return missing.length > 0 ? `Requires ${missing.join(', ')} to be completed first` : undefined
          })()} onGenerate={handleGenerate} isRunning={isPhaseRunning('image')}>
            {location.featured_image_url ? (
              <a
                href={`https://api.4prop.com/uploads/blog-posts/${location.featured_image_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative w-full aspect-video overflow-hidden rounded border">
                  <img
                    src={`https://api.4prop.com/uploads/blog-posts/${location.featured_image_url}`}
                    alt={`${location.street} featured`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.55)' }}>
                    <h1
                      className="font-bold leading-tight"
                      style={{ fontSize: 'clamp(1.5rem, 5vw, 3.5rem)' }}
                    >
                      {location.street}
                    </h1>
                    <p className="mt-2 text-2xl tracking-widest uppercase opacity-80">
                      {location.suburb || location.neighbourhood || location.borough}
                    </p>
                    {location.postcode && (
                      <span className="mt-5 px-4 py-1 rounded-full bg-orange-500 text-white text-xl font-semibold tracking-wider uppercase">
                        {location.postcode}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ) : (
              <span className="text-sm text-gray-400">No image</span>
            )}
          </CollapsiblePhaseCard>

          {/* Pre-Blog Phase */}
          <CollapsiblePhaseCard title="Pre-Blog" phase="pre-blog" completedAt={location.pre_blog_completed_at} streetLocationId={location.id} defaultOpen={false} disabledReason={missingFieldsReason || (!hasContent(location.keywords_primary_keyword) ? 'Requires SEO to be completed first' : undefined)} onGenerate={handleGenerate} isRunning={isPhaseRunning('pre-blog')}>
            <DetailRow label="New Title" value={location.new_title} />
            <MarkdownPreviewBox label="Key Takeaways" content={location.key_takeaways} />
            <MarkdownPreviewBox label="Outline" content={location.outline} />
          </CollapsiblePhaseCard>

          {/* Post-Blog Phase */}
          <CollapsiblePhaseCard title="Post-Blog" phase="post-blog" completedAt={location.post_blog_completed_at} streetLocationId={location.id} onGenerate={handleGenerate} isRunning={isPhaseRunning('post-blog')} disabledReason={missingFieldsReason || (() => {
            const missing = [
              !hasContent(location.key_anchors) && 'Key Anchors',
              !hasContent(location.nearest_stations) && 'Nearest Stations',
              !hasContent(location.keywords_primary_keyword) && 'SEO',
              !hasContent(location.outline) && 'Pre-Blog',
            ].filter(Boolean)
            return missing.length > 0 ? `Requires ${missing.join(', ')} to be completed first` : undefined
          })()}>
            <MarkdownPreviewBox label="Draft Markdown" content={location.draft_markdown} />
          </CollapsiblePhaseCard>

          {/* Publish Phase */}
          <CollapsiblePhaseCard title="Publish" phase="publish" completedAt={location.publish_completed_at} streetLocationId={location.id} onGenerate={handleGenerate} isRunning={isPhaseRunning('publish')} disabledReason={(() => {
            const missing = [
              !location.draft_markdown && 'Post-Blog',
              !location.featured_image_url && 'Image',
            ].filter(Boolean)
            return missing.length > 0 ? `Requires ${missing.join(', ')} to be completed first` : undefined
          })()}>
            <DetailRow label="Blog Post ID" value={location.blog_post_id} />
            <DetailRow
              label="Last Updated"
              value={parseDate(location.publish_updated_at)?.toLocaleString()}
            />
          </CollapsiblePhaseCard>
        </div>
      </div>

    </div>
  )
}
