import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generatePhase, fetchPhaseStatus } from '@/services/streetLocationService'

function loadTrackedIds(phase) {
  try {
    const stored = sessionStorage.getItem(`${phase}Generation.trackedIds`)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return []
}

function saveTrackedIds(phase, ids) {
  const key = `${phase}Generation.trackedIds`
  if (ids.length > 0) {
    sessionStorage.setItem(key, JSON.stringify(ids))
  } else {
    sessionStorage.removeItem(key)
  }
}

export function usePhaseGeneration(phase) {
  const queryClient = useQueryClient()
  const [trackedIds, setTrackedIds] = useState(() => loadTrackedIds(phase))
  const trackedIdsRef = useRef(trackedIds)

  // Keep ref in sync
  useEffect(() => {
    trackedIdsRef.current = trackedIds
    saveTrackedIds(phase, trackedIds)
  }, [trackedIds, phase])

  const generateMutation = useMutation({
    mutationFn: (ids) => generatePhase(phase, ids),
    onSuccess: (_data, ids) => {
      // All sent IDs are pending (returned or not — missing means already running)
      setTrackedIds((prev) => [...new Set([...prev, ...ids])])
    },
  })

  const statusQuery = useQuery({
    queryKey: [`${phase}Status`, trackedIds],
    queryFn: () => fetchPhaseStatus(phase, trackedIds),
    enabled: trackedIds.length > 0,
    refetchInterval: (query) => {
      const items = query.state.data ?? []
      const hasPending = items.some((s) => s.status === 'pending')
      return hasPending ? 3000 : false
    },
  })

  // When no more pending items, clear tracking and refresh data
  useEffect(() => {
    const items = statusQuery.data
    if (!items) return
    const allFinished = !items.some((s) => s.status === 'pending')
    if (allFinished) {
      setTrackedIds([])
      queryClient.invalidateQueries({ queryKey: ['streetLocations'] })
      queryClient.invalidateQueries({ queryKey: ['streetLocation'] })
    }
  }, [statusQuery.data, queryClient])

  const statusMap = new Map()
  if (statusQuery.data) {
    for (const item of statusQuery.data) {
      statusMap.set(item.streetLocationId, item.status)
    }
  }
  // IDs being tracked but not yet in status response are pending
  for (const id of trackedIds) {
    if (!statusMap.has(id)) {
      statusMap.set(id, 'pending')
    }
  }

  const generate = useCallback(
    (ids) => generateMutation.mutate(ids),
    [generateMutation]
  )

  const checkingRef = useRef(new Set())
  const checkStatus = useCallback(
    async (ids) => {
      // Skip IDs already tracked or currently being checked
      const untracked = ids.filter(
        (id) => !trackedIdsRef.current.includes(id) && !checkingRef.current.has(id)
      )
      if (untracked.length === 0) return
      untracked.forEach((id) => checkingRef.current.add(id))
      try {
        const items = await fetchPhaseStatus(phase, untracked)
        const hasPending = items.some((s) => s.status === 'pending')
        if (hasPending) {
          setTrackedIds((prev) => [...new Set([...prev, ...untracked])])
        }
      } finally {
        untracked.forEach((id) => checkingRef.current.delete(id))
      }
    },
    [phase]
  )

  return {
    generate,
    checkStatus,
    statusMap,
    isGenerating: generateMutation.isPending,
    isPolling: trackedIds.length > 0,
  }
}
