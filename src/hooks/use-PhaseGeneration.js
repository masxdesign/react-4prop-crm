import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { generatePhase } from '@/services/streetLocationService'

/**
 * Fires a phase generate request. No polling, no status tracking.
 * The caller is responsible for refreshing data (e.g. via the bulk status poller).
 */
export function usePhaseGeneration(phase) {
  const mutation = useMutation({
    mutationFn: (ids) => generatePhase(phase, ids),
  })

  const generate = useCallback((ids) => mutation.mutate(ids), [mutation])

  return {
    generate,
    isGenerating: mutation.isPending,
  }
}
