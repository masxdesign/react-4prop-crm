import { useState, useEffect } from 'react'
import { ChevronDown, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { usePhaseGeneration } from '@/hooks/use-PhaseGeneration'
import { PhaseStatus } from './DetailComponents'

export function PhaseGenerateButton({ phase, streetLocationId, disabledReason, completedAt, onGeneratingChange, onGenerate, isRunning, suffix, compact }) {
  const { generate, isGenerating } = usePhaseGeneration(phase)
  const busy = isGenerating || !!isRunning

  useEffect(() => {
    onGeneratingChange?.(busy)
  }, [busy, onGeneratingChange])

  const blocked = !!disabledReason
  const label = (completedAt ? 'Regenerate' : 'Generate') + (suffix ? ` ${suffix}` : '')

  const handleClick = (e) => {
    e.stopPropagation()
    generate([streetLocationId])
    onGenerate?.(phase, streetLocationId)
  }

  if (compact) {
    return (
      <Button
        size="sm"
        disabled={busy || blocked}
        onClick={handleClick}
        title={blocked ? disabledReason : undefined}
        className="h-6 px-2 text-xs gap-1 shrink-0 border-0 cursor-pointer bg-linear-to-br from-blue-500 via-sky-500 to-teal-400 text-white hover:shadow-md hover:shadow-sky-500/25 transition-shadow"
      >
        {busy ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>generating…</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3" />
            <span>{completedAt ? 'redo' : 'run'}</span>
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      disabled={busy || blocked}
      onClick={handleClick}
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

export function CollapsiblePhaseCard({ title, phase, completedAt, streetLocationId, defaultOpen = true, disabledReason, onGenerate, isRunning, children }) {
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
          {phase && <div className={isBusy ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100 transition-opacity'}><PhaseGenerateButton phase={phase} streetLocationId={streetLocationId} disabledReason={disabledReason} completedAt={completedAt} onGeneratingChange={setIsBusy} onGenerate={onGenerate} isRunning={isRunning} /></div>}
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
