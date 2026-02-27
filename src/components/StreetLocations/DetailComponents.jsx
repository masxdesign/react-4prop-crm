import { useState, useRef } from 'react'
import { CheckCircle2, Circle, Loader2, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { parseDate, formatCompletedDate } from './streetDetailUtils'

export function PhaseStatus({ completedAt }) {
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

export function DetailRow({ label, value }) {
  return (
    <div className="space-y-0.5 border-b border-gray-100 py-2">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-base text-gray-900 max-w-prose">{value ?? '—'}</div>
    </div>
  )
}

export function EditableDetailRow({ label, value, onSave, saving }) {
  const [editing, setEditing] = useState(false)
  const [optimistic, setOptimistic] = useState(null)
  const inputRef = useRef(null)

  // Clear optimistic value once the server value catches up
  if (optimistic !== null && value === optimistic) {
    setOptimistic(null)
  }

  const displayValue = optimistic ?? value

  const handleSave = () => {
    const newValue = inputRef.current?.value?.trim() ?? ''
    setEditing(false)
    if (newValue !== (value ?? '')) {
      setOptimistic(newValue)
      onSave(newValue)
    }
  }

  if (editing) {
    return (
      <div className="space-y-0.5 border-b border-gray-100 py-2">
        <div className="text-sm text-gray-400">{label}</div>
        <Input
          ref={inputRef}
          defaultValue={displayValue ?? ''}
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
        {displayValue || '—'}
        {saving && optimistic !== null && <Loader2 className="h-3 w-3 animate-spin text-gray-400 shrink-0" />}
        <Pencil className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    </div>
  )
}
