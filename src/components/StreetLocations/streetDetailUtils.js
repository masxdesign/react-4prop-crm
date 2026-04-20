import { distance, point } from '@turf/turf'

export function calcDistance(centerLat, centerLon, lat, lon) {
  return Math.round(
    distance(point([centerLon, centerLat]), point([lon, lat]), { units: 'meters' })
  )
}

export function recalcAnchorDistances(anchors, lat, lon) {
  if (!anchors) return null
  try {
    const arr = typeof anchors === 'string' ? JSON.parse(anchors) : anchors
    if (!Array.isArray(arr) || arr.length === 0) return null
    return arr.map((a) =>
      a.lat != null && a.lon != null
        ? { ...a, distance_m: calcDistance(lat, lon, a.lat, a.lon) }
        : a
    )
  } catch {
    return null
  }
}

export function parseDate(value) {
  if (!value) return null
  // If it's a number or numeric string, treat as Unix timestamp
  const num = Number(value)
  if (!isNaN(num) && num > 0) {
    // If less than 1e12, it's seconds — convert to ms
    const ms = num < 1e12 ? num * 1000 : num
    const d = new Date(ms)
    if (!isNaN(d.getTime())) return d
  }
  // Try parsing as ISO/date string
  const d = new Date(value)
  if (!isNaN(d.getTime())) return d
  return null
}

export function formatCompletedDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
