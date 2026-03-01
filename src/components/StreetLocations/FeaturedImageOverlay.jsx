import { CATEGORY_CONFIG, DEFAULT_CONFIG } from './StreetMaps'

const BASE_URL = 'https://api.4prop.com/uploads/blog-posts'

const variants = {
  full: {
    streetStyle: { fontSize: 'clamp(1.5rem, 5vw, 3.5rem)' },
    cityClass: 'mt-2 text-2xl tracking-widest uppercase opacity-80',
    pillClass: 'mt-5 px-4 py-1 rounded-full bg-orange-500 text-white text-xl font-semibold tracking-wider uppercase',
    padClass: 'px-8',
    iconSize: 'h-11 w-11',
    iconWrap: 'mb-4 flex items-center gap-7 opacity-80',
  },
  thumbnail: {
    streetStyle: { fontSize: 'clamp(1.1rem, 6cqw, 2rem)', whiteSpace: 'nowrap' },
    cityClass: 'mt-1 text-xs tracking-widest uppercase opacity-80',
    pillClass: 'mt-2 px-3 py-0.5 rounded-full bg-orange-500 text-white text-sm font-semibold tracking-wider uppercase',
    padClass: 'px-4',
    iconSize: 'h-5 w-5',
    iconWrap: 'mb-2 flex items-center gap-3 opacity-80',
  },
}

export default function FeaturedImageOverlay({ imageUrl, street, city, postcode, categories, variant = 'full' }) {
  const v = variants[variant]
  const src = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}/${imageUrl}`

  // Deduplicate categories and resolve icons
  const uniqueCategories = categories ? [...new Set(categories)] : []

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded border" style={{ containerType: 'inline-size' }}>
      <img src={src} alt={street} className="absolute inset-0 w-full h-full object-cover" />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center ${v.padClass}`}
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.55)' }}
      >
        {uniqueCategories.length > 0 && (
          <div className={v.iconWrap}>
            {uniqueCategories.map((cat) => {
              const { Icon } = CATEGORY_CONFIG[cat] || DEFAULT_CONFIG
              return <Icon key={cat} className={v.iconSize} strokeWidth={1.5} />
            })}
          </div>
        )}
        <h1 className="font-bold leading-tight" style={v.streetStyle}>
          {street}
        </h1>
        {city && <p className={v.cityClass}>{city}</p>}
        {postcode && <span className={v.pillClass}>{postcode}</span>}
      </div>
    </div>
  )
}
