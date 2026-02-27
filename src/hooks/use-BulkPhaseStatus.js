import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBulkStatus } from '@/services/streetLocationService'

/**
 * Polls /bulk/status every 3s unconditionally while the component is mounted
 * and there are ids to check.
 *
 * Call markPending(ids, phase) after firing a generate to show optimistic
 * badges immediately before the next poll arrives.
 *
 * @param allIds   - array of streetLocationIds to poll
 * @param onComplete - optional callback fired when pending jobs clear (use for invalidation)
 *
 * Returns:
 *   statusMap   — Map<streetLocationId, Map<phase, 'pending'>>
 *   markPending(ids, phase) — optimistically mark ids as pending
 */
export function useStreetLocationStatus(allIds, onComplete, queryKeySuffix) {
  const queryClient = useQueryClient()
  const [optimisticPhases, setOptimisticPhases] = useState(new Map())
  const allIdsRef = useRef(allIds)
  allIdsRef.current = allIds
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasIds = allIds.length > 0
  const keySuffix = queryKeySuffix ?? allIds[0] ?? 'list'

  // Stable query key — allIdsRef keeps the queryFn current without key churn
  const poll = useQuery({
    queryKey: ['streetStatus', 'poll', keySuffix],
    queryFn: () => fetchBulkStatus(allIdsRef.current),
    enabled: hasIds,
    refetchInterval: 3000,
    staleTime: 5000,
  })

  // Clear optimistic phases that are no longer pending
  useEffect(() => {
    if (!poll.data) return
    const stillPending = new Set(
      poll.data.filter(item => item.status === 'pending').map(item => Number(item.streetLocationId))
    )
    setOptimisticPhases(prev => {
      if (prev.size === 0) return prev
      const next = new Map(prev)
      for (const id of prev.keys()) {
        if (!stillPending.has(id)) next.delete(id)
      }
      return next.size === prev.size ? prev : next
    })
  }, [poll.data])

  // When all pending jobs clear, call onComplete (or default to byPrefix invalidation)
  useEffect(() => {
    if (!poll.data) return
    const hasPending = poll.data.some(item => item.status === 'pending')
    if (!hasPending && optimisticPhases.size > 0) {
      if (onCompleteRef.current) {
        onCompleteRef.current()
      } else {
        queryClient.invalidateQueries({ queryKey: ['streetLocations', 'byPrefix'] })
      }
    }
  }, [poll.data, optimisticPhases.size, queryClient])

  // Build statusMap: real poll data merged with optimistic state
  // All keys are coerced to Number so string/number id mismatches don't cause lookup failures
  const statusMap = new Map()
  if (poll.data) {
    for (const item of poll.data) {
      if (item.status === 'pending') {
        const id = Number(item.streetLocationId)
        if (!statusMap.has(id)) statusMap.set(id, new Map())
        statusMap.get(id).set(item.phase, 'pending')
      }
    }
  }
  for (const [id, phases] of optimisticPhases) {
    const nid = Number(id)
    if (!statusMap.has(nid)) statusMap.set(nid, new Map())
    for (const phase of phases) {
      if (!statusMap.get(nid).has(phase)) statusMap.get(nid).set(phase, 'pending')
    }
  }

  const markPending = useCallback((ids, phase) => {
    if (!phase) return
    setOptimisticPhases(prev => {
      const next = new Map(prev)
      for (const id of ids) {
        const nid = Number(id)
        if (!next.has(nid)) next.set(nid, new Set())
        next.get(nid).add(phase)
      }
      return next
    })
  }, [])

  return { statusMap, markPending }
}
