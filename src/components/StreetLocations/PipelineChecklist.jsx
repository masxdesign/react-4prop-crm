import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PhaseGenerateButton } from './PhaseComponents'

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
    completedAtKey: 'key_anchors_completed_at',
    check: (l) => !!l.key_anchors_completed_at,
    blocked: (l, mfr) => !!mfr,
  },
  {
    label: 'Nearest Stations',
    description: 'Uses coordinates, postcode & street to find transport links',
    phase: 'nearest-stations',
    completedAtKey: 'nearest_stations_completed_at',
    check: (l) => !!l.nearest_stations_completed_at,
    blocked: (l, mfr) => !!mfr,
  },
  {
    label: 'SEO',
    description: 'Uses location data to generate keywords, tone & writing brief',
    phase: 'seo',
    completedAtKey: 'seo_completed_at',
    check: (l) => !!l.seo_completed_at,
    blocked: (l, mfr) => !!mfr,
  },
  {
    label: 'Pre-Blog',
    description: 'Uses SEO brief to produce title, takeaways & outline',
    phase: 'pre-blog',
    completedAtKey: 'pre_blog_completed_at',
    check: (l) => !!l.pre_blog_completed_at,
    blocked: (l, mfr) => !!mfr || !l.seo_completed_at,
  },
  {
    label: 'Post-Blog',
    description: 'Uses anchors, stations, SEO & outline to write the full article',
    phase: 'post-blog',
    completedAtKey: 'post_blog_completed_at',
    check: (l) => !!l.post_blog_completed_at,
    blocked: (l, mfr) => !!mfr || !l.key_anchors_completed_at || !l.nearest_stations_completed_at || !l.seo_completed_at || !l.pre_blog_completed_at,
  },
  {
    label: 'Image',
    description: 'Uses the article to generate a featured image',
    phase: 'image',
    completedAtKey: 'image_completed_at',
    check: (l) => !!l.image_completed_at,
    blocked: (l) => !l.post_blog_completed_at,
  },
  {
    label: 'Publish',
    description: 'Publishes the article and image to the blog',
    phase: 'publish',
    completedAtKey: 'publish_completed_at',
    check: (l) => !!l.publish_completed_at,
    blocked: (l) => !l.image_completed_at,
  },
]

export default function PipelineChecklist({ location, missingFieldsReason }) {
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
                          completedAt={location[step.completedAtKey]}
                          disabledReason={step.blocked ? 'Blocked by dependencies' : undefined}
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
