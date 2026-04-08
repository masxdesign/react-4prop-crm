import { useState, useRef, useEffect } from 'react'
import ReactMarkdownPrimitive from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MapPin, Clock } from 'lucide-react'

export function JsonArrayDisplay({ value }) {
  if (!value) return <span className="text-gray-400">—</span>
  try {
    const arr = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(arr) || arr.length === 0) return <span className="text-gray-400">—</span>
    return (
      <div className="space-y-1">
        {arr.map((item, i) => (
          <div key={i} className="text-sm bg-gray-50 rounded px-2 py-1.5">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ))}
      </div>
    )
  } catch {
    return <span className="text-sm text-gray-500 break-all">{String(value)}</span>
  }
}

const mdComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mt-3 mb-1.5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-gray-800 mt-2 mb-1">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold text-gray-800 mt-2 mb-1">{children}</h4>,
  p: ({ children }) => <p className="text-sm text-gray-700 mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-0.5 text-sm text-gray-700">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5 text-sm text-gray-700">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  a: ({ children, ...props }) => <a {...props} className="underline text-blue-600" target="_blank" rel="noreferrer">{children}</a>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-600 my-2">{children}</blockquote>,
  table: ({ children }) => <table className="text-sm border-collapse w-full my-2">{children}</table>,
  th: ({ children }) => <th className="border border-gray-200 px-2 py-1 bg-gray-50 text-left font-medium text-gray-700">{children}</th>,
  td: ({ children }) => <td className="border border-gray-200 px-2 py-1 text-gray-700">{children}</td>,
}

export function MarkdownPreviewBox({ label, content }) {
  const [expanded, setExpanded] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    if (!expanded) return
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setExpanded(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [expanded])

  if (!content) {
    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-400">{label}</div>
        <span className="text-sm text-gray-400">—</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-400">{label}</div>
      <div
        ref={boxRef}
        className={`relative rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-all duration-300 ${expanded ? '' : 'max-h-32 overflow-hidden'}`}
        onClick={() => {
          setExpanded((v) => {
            if (!v) {
              setTimeout(() => boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
            }
            return !v
          })
        }}
      >
        <div className="p-3 max-w-prose">
          <ReactMarkdownPrimitive components={mdComponents} remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdownPrimitive>
        </div>
        {!expanded && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white to-transparent rounded-b-lg pointer-events-none" />
        )}
      </div>
    </div>
  )
}

// TfL roundel: thick coloured ring, blue crossbar over the centre, white label on bar
// Matches the real roundel: solid ring colour with white centre, bar overlaid
function TflRoundel({ ring, bar = '#003580', label, size = 20 }) {
  const id = `clip-${label.replace(/\s+/g, '-')}`
  // viewBox is 44x36. Circle centre at 22,18. Bar extends to x=-2..46, poking 2px outside the r=17 circle on each side.
  return (
    <svg width={size} height={size * 36 / 44} viewBox="0 0 44 36" aria-label={label} className="shrink-0">
      <defs>
        <clipPath id={id}>
          <circle cx="22" cy="18" r="17" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <circle cx="22" cy="18" r="17" fill={ring} />
        <circle cx="22" cy="18" r="10.5" fill="white" />
      </g>
      {/* bar sits over the ring, extends 3px beyond on each side — not clipped */}
      <rect x="2" y="13.5" width="40" height="9" fill={bar} rx="1" />
    </svg>
  )
}

// National Rail logo: the NR "arrow" symbol approximated as an SVG
function NationalRailIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-label="National Rail" className="shrink-0">
      <rect width="36" height="36" rx="4" fill="#1C3F6E" />
      {/* Simplified NR double-arrow silhouette */}
      <path
        d="M10 22 L18 10 L26 22 M14 18 L22 18"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path
        d="M10 14 L18 26 L26 14"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  )
}

const TRANSPORT_MODES = {
  // ring = outer donut colour, bar = crossbar colour (defaults to TfL blue)
  tube:             () => <TflRoundel ring="#E32017" label="Tube" />,
  underground:      () => <TflRoundel ring="#E32017" label="Tube" />,
  overground:       () => <TflRoundel ring="#EE7C0E" bar="#EE7C0E" label="Ovgrd" />,
  'elizabeth-line': () => <TflRoundel ring="#6950A1" bar="#6950A1" label="Eliz" />,
  'elizabeth line': () => <TflRoundel ring="#6950A1" bar="#6950A1" label="Eliz" />,
  elizabeth:        () => <TflRoundel ring="#6950A1" bar="#6950A1" label="Eliz" />,
  dlr:              () => <TflRoundel ring="#00AFAD" bar="#00AFAD" label="DLR" />,
  'national-rail':  () => <NationalRailIcon />,
  'national rail':  () => <NationalRailIcon />,
  rail:             () => <NationalRailIcon />,
  tram:             () => <TflRoundel ring="#66A226" bar="#66A226" label="Tram" />,
  bus:              () => <TflRoundel ring="#E32017" label="Bus" />,
  cable:            () => <TflRoundel ring="#E21836" bar="#E21836" label="Cable" />,
}

function TransportModeBadge({ mode }) {
  const key = (mode || '').toLowerCase().trim()
  const Render = TRANSPORT_MODES[key]
  if (Render) return <Render />
  // fallback: plain grey pill for unknown modes
  return (
    <span className="inline-flex items-center rounded bg-gray-400 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-white shrink-0 min-w-[36px] justify-center">
      {mode || '?'}
    </span>
  )
}

export function NearestStationsTable({ value }) {
  if (!value) return <span className="text-gray-400">—</span>
  try {
    const stations = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(stations) || stations.length === 0) return <span className="text-gray-400">—</span>
    return (
      <div className="space-y-1">
        {stations.map((s, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
            <TransportModeBadge mode={s.mode} />
            <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">{s.name}</span>
            <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500 tabular-nums">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3 text-gray-400" />
                {s.distance_m != null ? `${s.distance_m}m` : '—'}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3 text-gray-400" />
                {s.walk_time_min != null ? `${s.walk_time_min} min` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  } catch {
    return <span className="text-xs text-gray-500 break-all">{String(value)}</span>
  }
}

const STREET_PROFILE_FIELDS = [
  { key: 'footfall_signal', label: 'Footfall Signal' },
  { key: 'retail_mix', label: 'Retail Mix' },
  { key: 'evening_economy', label: 'Evening Economy' },
  { key: 'connectivity', label: 'Connectivity' },
  { key: 'blog_angle', label: 'Blog Angle' },
]

export function CuratedNearbyDisplay({ value, showTitle = true }) {
  if (!value) return null
  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value
    if (!data || typeof data !== 'object') return null
    return (
      <div className="space-y-3">
        {showTitle && <div className="text-sm text-gray-500 font-medium">Featured Anchors</div>}
        {data.editorial_summary && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Editorial Summary</div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2">
              {data.editorial_summary}
            </div>
          </div>
        )}
        {data.street_profile && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Street Profile</div>
            {typeof data.street_profile === 'object' ? (
              <div className="space-y-1.5 bg-gray-50 rounded p-2">
                {STREET_PROFILE_FIELDS.map(({ key, label }) =>
                  data.street_profile[key] ? (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500">{label}:</span>{' '}
                      <span className="text-gray-900">{data.street_profile[key]}</span>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-2">
                {String(data.street_profile)}
              </div>
            )}
          </div>
        )}
        {data.curated_anchors && Array.isArray(data.curated_anchors) && data.curated_anchors.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Featured Anchors</div>
            <div className="flex flex-wrap gap-1">
              {data.curated_anchors.map((anchor, i) => (
                <span key={i} className="text-xs bg-gray-100 rounded px-2 py-0.5">
                  {typeof anchor === 'object' ? JSON.stringify(anchor) : anchor}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.removed && Array.isArray(data.removed) && data.removed.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Removed</div>
            <div className="flex flex-wrap gap-1">
              {data.removed.map((item, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-600 rounded px-2 py-0.5">
                  {typeof item === 'object' ? JSON.stringify(item) : item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch {
    return <span className="text-xs text-gray-500 break-all">{String(value)}</span>
  }
}
