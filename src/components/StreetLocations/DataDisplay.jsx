import { useState, useRef, useEffect } from 'react'
import ReactMarkdownPrimitive from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

export function NearestStationsTable({ value }) {
  if (!value) return <span className="text-gray-400">—</span>
  try {
    const stations = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(stations) || stations.length === 0) return <span className="text-gray-400">—</span>
    return (
      <div className="text-xs space-y-1">
        {stations.map((s, i) => (
          <div key={i} className="bg-gray-50 rounded px-2 py-1">
            <span className="font-medium">{s.name}</span>
            {s.mode && <span className="text-gray-500 ml-1">({s.mode})</span>}
            {s.distance_m != null && <span className="text-gray-500 ml-1">— {s.distance_m}m</span>}
            {s.walk_time_min != null && <span className="text-gray-500 ml-1">({s.walk_time_min} min walk)</span>}
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
