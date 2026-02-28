import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PhaseGenerateButton } from './PhaseComponents'

export function hasContent(value) {
  if (value == null) return false
  if (typeof value === 'string') {
    if (value.trim() === '' || value === '[]' || value === '{}') return false
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.length > 0
      if (typeof parsed === 'object') return Object.keys(parsed).length > 0
    } catch { /* not JSON, treat as plain string */ }
    return true
  }
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return !!value
}

const PIPELINE_STEPS = [
  {
    label: 'Set Coordinates',
    description: 'Pin the street on the map',
    check: (l) => l.lat != null && l.lon != null,
    blocked: () => false,
  },
  {
    label: 'Key Anchors',
    description: 'Uses coordinates, postcode & street to find nearby landmarks',
    phase: 'key-anchors',
    check: (l) => hasContent(l.key_anchors) && hasContent(l.curated_nearby),
    blocked: (_l, mfr) => !!mfr,
  },
  {
    label: 'Nearest Stations',
    description: 'Uses coordinates, postcode & street to find transport links',
    phase: 'nearest-stations',
    check: (l) => hasContent(l.nearest_stations),
    blocked: (_l, mfr) => !!mfr,
  },
  {
    label: 'SEO',
    description: 'Uses location data to generate keywords, tone & writing brief',
    phase: 'seo',
    check: (l) => hasContent(l.keywords_primary_keyword),
    blocked: (_l, mfr) => !!mfr,
  },
  {
    label: 'Image',
    description: 'Uses coordinates, key anchors & featured anchors to generate a featured image',
    phase: 'image',
    check: (l) => hasContent(l.featured_image_url),
    blocked: (l) => l.lat == null || l.lon == null || !hasContent(l.key_anchors) || !hasContent(l.curated_nearby),
  },
  {
    label: 'Pre-Blog',
    description: 'Uses SEO brief to produce title, takeaways & outline',
    phase: 'pre-blog',
    check: (l) => hasContent(l.outline),
    blocked: (l, mfr) => !!mfr || !hasContent(l.keywords_primary_keyword),
  },
  {
    label: 'Post-Blog',
    description: 'Uses anchors, stations, SEO & outline to write the full article',
    phase: 'post-blog',
    check: (l) => hasContent(l.draft_markdown),
    blocked: (l, mfr) => !!mfr || !hasContent(l.key_anchors) || !hasContent(l.nearest_stations) || !hasContent(l.keywords_primary_keyword) || !hasContent(l.outline),
  },
  {
    label: 'Publish',
    description: 'Publishes the post-blog article and featured image to the blog',
    phase: 'publish',
    check: (l) => hasContent(l.blog_post_id),
    blocked: (l) => !hasContent(l.draft_markdown) || !hasContent(l.featured_image_url),
  },
]

export default function PipelineChecklist({ location, missingFieldsReason, onGenerate, isRunning }) {
  const steps = PIPELINE_STEPS.map((step) => ({
    ...step,
    done: step.check(location),
    blocked: step.blocked(location, missingFieldsReason),
  }))

  // First incomplete, unblocked step is the "next" step
  const nextIndex = steps.findIndex((s) => !s.done && !s.blocked)

  return (
    <Card>
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-sm">Checklist</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="relative">
          {steps.map((step, i) => {
            const isNext = i === nextIndex
            return (
              <div key={step.label} className="flex items-start gap-2 relative">
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div className={`absolute left-[9px] top-[20px] w-px h-[calc(100%-4px)] ${step.done ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
                {/* Icon */}
                <div className="relative z-[1] shrink-0 mt-1.5">
                  {step.done ? (
                    <CheckCircle2 className="h-[18px] w-[18px] text-green-500" />
                  ) : step.blocked ? (
                    <Circle className="h-[18px] w-[18px] text-gray-200" />
                  ) : (
                    <Circle className={`h-[18px] w-[18px] ${isNext ? 'text-blue-400' : 'text-gray-300'}`} />
                  )}
                </div>
                {/* Label + description + button */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-1">
                    <span className={`text-sm leading-tight ${
                      step.done ? 'text-gray-400 line-through' :
                      step.blocked ? 'text-gray-300' :
                      isNext ? 'text-blue-600 font-medium' :
                      'text-gray-600'
                    }`}>
                      {step.label}
                    </span>
                    {step.phase && !step.blocked && (
                      <div className="ml-auto shrink-0">
                        <PhaseGenerateButton
                          phase={step.phase}
                          streetLocationId={location.id}
                          completedAt={step.done ? true : null}
                          disabledReason={step.blocked ? 'Blocked by dependencies' : undefined}
                          onGenerate={onGenerate}
                          isRunning={isRunning?.(step.phase)}
                          compact
                        />
                      </div>
                    )}
                  </div>
                  <p className={`text-xs leading-snug mt-0.5 ${step.blocked ? 'text-gray-300' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
