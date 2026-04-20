import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * An expandable inline code block with a copy button.
 *
 * Props:
 *   label     string   — short label shown in the toggle row (e.g. "CSS", "HTML")
 *   code      string   — the code to display and copy
 *   language  string   — decorative language label shown inside the block
 */
export default function InlineCodeBlock({ label, code, language = 'html' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded border overflow-hidden">
      {/* Toggle row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground bg-muted/60 hover:bg-muted transition-colors"
      >
        <span className="font-mono">{label}</span>
        <div className="flex items-center gap-2">
          {open && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleCopy}
              onKeyDown={(e) => e.key === 'Enter' && handleCopy(e)}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border bg-background hover:bg-accent transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </span>
          )}
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Code area */}
      {open && (
        <pre className="text-xs font-mono p-3 overflow-auto max-h-64 bg-background leading-relaxed whitespace-pre">
          {code}
        </pre>
      )}
    </div>
  )
}
