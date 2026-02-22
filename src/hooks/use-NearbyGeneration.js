import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generateNearby, fetchNearbyStatus } from '@/services/streetLocationService'

const STORAGE_KEY = 'nearbyGeneration.trackedIds'

function loadTrackedIds() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return []
}

function saveTrackedIds(ids) {
  if (ids.length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function useNearbyGeneration() {
  const queryClient = useQueryClient()
  const [trackedIds, setTrackedIds] = useState(loadTrackedIds)
  const trackedIdsRef = useRef(trackedIds)

  // Keep ref in sync
  useEffect(() => {
    trackedIdsRef.current = trackedIds
    saveTrackedIds(trackedIds)
  }, [trackedIds])

  const generateMutation = useMutation({
    mutationFn: (ids) => generateNearby(ids),
    onSuccess: (_data, ids) => {
      // All sent IDs are pending (returned or not — missing means already running)
      setTrackedIds((prev) => [...new Set([...prev, ...ids])])
    },
  })

  const statusQuery = useQuery({
    queryKey: ['nearbyStatus', trackedIds],
    queryFn: () => fetchNearbyStatus(trackedIds),
    enabled: trackedIds.length > 0,
    refetchInterval: (query) => {
      const items = query.state.data ?? []
      const hasPending = items.length === 0 || items.some((s) => s.status === 'pending')
      return hasPending ? 3000 : false
    },
  })

  // When all tracked items are finished, clear tracking and refresh data
  useEffect(() => {
    const items = statusQuery.data
    if (!items || items.length === 0) return
    const allFinished = items.every((s) => s.status === 'finished')
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
        const items = await fetchNearbyStatus(untracked)
        const hasPending = items.some((s) => s.status === 'pending')
        if (hasPending) {
          setTrackedIds((prev) => [...new Set([...prev, ...untracked])])
        }
      } finally {
        untracked.forEach((id) => checkingRef.current.delete(id))
      }
    },
    []
  )

  return {
    generate,
    checkStatus,
    statusMap,
    isGenerating: generateMutation.isPending,
    isPolling: trackedIds.length > 0,
  }
}
