import { CATEGORY_CONFIG, DEFAULT_CONFIG } from './StreetMaps'

const BASE_URL = 'https://api.4prop.com/uploads/blog-posts'

/**
 * CSS required on any external website that renders the featured image overlay.
 * font-family is intentionally omitted — inherit from the host site.
 * Copy this entire string into a <style> tag or stylesheet.
 */
export const FIO_CSS = `.fio-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  container-type: inline-size;
}
.fio-wrapper img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fio-wrapper .fio-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
}

/* Full variant */
.fio-full .fio-overlay       { padding: 0 clamp(0.75rem, 3cqw, 2rem); }
.fio-full .fio-icons         { margin-bottom: clamp(0.4rem, 2cqw, 1rem); display: flex; align-items: center; gap: clamp(0.75rem, 3cqw, 1.75rem); opacity: 0.8; }
.fio-full .fio-icons svg     { width: clamp(1.25rem, 5cqw, 2.75rem); height: clamp(1.25rem, 5cqw, 2.75rem); }
.fio-full .fio-street        { font-size: clamp(1.25rem, 7cqw, 3.5rem); font-weight: 700; line-height: 1.25; }
.fio-full .fio-city          { margin-top: clamp(0.2rem, 1cqw, 0.5rem); font-size: clamp(0.75rem, 3cqw, 1.5rem); letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.8; }
.fio-full .fio-pill-row      { margin-top: clamp(0.4rem, 2cqw, 1.25rem); display: flex; align-items: center; gap: clamp(0.25rem, 1cqw, 0.5rem); }
.fio-full .fio-line          { height: 2px; width: clamp(1rem, 4cqw, 2.5rem); border-radius: 9999px; background: #f97316; }
.fio-full .fio-pill          { padding: clamp(0.15rem, 0.5cqw, 0.25rem) clamp(0.5rem, 2cqw, 1rem); border-radius: 9999px; background: #f97316; color: #fff; font-size: clamp(0.7rem, 2.5cqw, 1.25rem); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }

/* fio-thumbnail is an alias for fio-full — same responsive behaviour */
.fio-thumbnail .fio-overlay  { padding: 0 clamp(0.75rem, 3cqw, 2rem); }
.fio-thumbnail .fio-icons    { margin-bottom: clamp(0.4rem, 2cqw, 1rem); display: flex; align-items: center; gap: clamp(0.75rem, 3cqw, 1.75rem); opacity: 0.8; }
.fio-thumbnail .fio-icons svg{ width: clamp(1.25rem, 5cqw, 2.75rem); height: clamp(1.25rem, 5cqw, 2.75rem); }
.fio-thumbnail .fio-street   { font-size: clamp(1.25rem, 7cqw, 3.5rem); font-weight: 700; line-height: 1.25; }
.fio-thumbnail .fio-city     { margin-top: clamp(0.2rem, 1cqw, 0.5rem); font-size: clamp(0.75rem, 3cqw, 1.5rem); letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.8; }
.fio-thumbnail .fio-pill-row { margin-top: clamp(0.4rem, 2cqw, 1.25rem); display: flex; align-items: center; gap: clamp(0.25rem, 1cqw, 0.5rem); }
.fio-thumbnail .fio-line     { height: 2px; width: clamp(1rem, 4cqw, 2.5rem); border-radius: 9999px; background: #f97316; }
.fio-thumbnail .fio-pill     { padding: clamp(0.15rem, 0.5cqw, 0.25rem) clamp(0.5rem, 2cqw, 1rem); border-radius: 9999px; background: #f97316; color: #fff; font-size: clamp(0.7rem, 2.5cqw, 1.25rem); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }`

/**
 * Generates a self-contained HTML snippet for a given variant.
 * The snippet uses only the fio-* classes — pair it with FIO_CSS.
 *
 * @param {{ imageUrl: string, street: string, city?: string, postcode?: string, categories?: string[] }} props
 * @param {'full'|'thumbnail'} variant
 * @returns {string} HTML string
 */
function iconSvg(category, categorySvgs) {
  const paths = categorySvgs[category] || categorySvgs.default
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

export function buildOverlayHtml({ imageUrl, street, city, postcode, categories = [], categorySvgs = {} }, variant = 'full') {
  const src = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}/${imageUrl}`
  const uniqueCategories = [...new Set(categories)]

  const iconsHtml = uniqueCategories.length > 0
    ? `\n  <div class="fio-icons">\n${uniqueCategories.map((cat) => `    ${iconSvg(cat, categorySvgs)}`).join('\n')}\n  </div>`
    : ''

  const cityHtml = city ? `\n  <p class="fio-city">${city}</p>` : ''
  const postcodeHtml = postcode
    ? `\n  <div class="fio-pill-row">\n    <div class="fio-line"></div>\n    <span class="fio-pill">${postcode}</span>\n    <div class="fio-line"></div>\n  </div>`
    : ''

  return `<div class="fio-wrapper fio-${variant}">
  <img src="${src}" alt="${street}" />
  <div class="fio-overlay">${iconsHtml}
  <h1 class="fio-street">${street}</h1>${cityHtml}${postcodeHtml}
  </div>
</div>`
}

const s = {
  overlay: { padding: '0 clamp(0.75rem, 3cqw, 2rem)' },
  iconWrap: { marginBottom: 'clamp(0.4rem, 2cqw, 1rem)', display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem, 3cqw, 1.75rem)', opacity: 0.8 },
  iconSize: { width: 'clamp(1.25rem, 5cqw, 2.75rem)', height: 'clamp(1.25rem, 5cqw, 2.75rem)' },
  street: { fontSize: 'clamp(1.25rem, 7cqw, 3.5rem)', fontWeight: 700, lineHeight: 1.25 },
  city: { marginTop: 'clamp(0.2rem, 1cqw, 0.5rem)', fontSize: 'clamp(0.75rem, 3cqw, 1.5rem)', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 },
  pillRow: { marginTop: 'clamp(0.4rem, 2cqw, 1.25rem)', display: 'flex', alignItems: 'center', gap: 'clamp(0.25rem, 1cqw, 0.5rem)' },
  line: { height: '2px', width: 'clamp(1rem, 4cqw, 2.5rem)', borderRadius: '9999px', background: '#f97316', flexShrink: 0 },
  pill: { padding: 'clamp(0.15rem, 0.5cqw, 0.25rem) clamp(0.5rem, 2cqw, 1rem)', borderRadius: '9999px', background: '#f97316', color: '#fff', fontSize: 'clamp(0.7rem, 2.5cqw, 1.25rem)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' },
}

export default function FeaturedImageOverlay({ imageUrl, street, city, postcode, categories, variant = 'full' }) {
  const src = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}/${imageUrl}`
  const uniqueCategories = categories ? [...new Set(categories)] : []

  return (
    <div
      className={`fio-wrapper fio-${variant}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
        containerType: 'inline-size',
      }}
    >
      <img
        src={src}
        alt={street}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div
        className="fio-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(0,0,0,0.55)',
          ...s.overlay,
        }}
      >
        {uniqueCategories.length > 0 && (
          <div className="fio-icons" style={s.iconWrap}>
            {uniqueCategories.map((cat) => {
              const { Icon } = CATEGORY_CONFIG[cat] || DEFAULT_CONFIG
              return <Icon key={cat} style={s.iconSize} strokeWidth={1.5} />
            })}
          </div>
        )}
        <h1 className="fio-street" style={s.street}>
          {street}
        </h1>
        {city && (
          <p className="fio-city" style={s.city}>
            {city}
          </p>
        )}
        {postcode && (
          <div className="fio-pill-row" style={s.pillRow}>
            <div className="fio-line" style={s.line} />
            <span className="fio-pill" style={s.pill}>
              {postcode}
            </span>
            <div className="fio-line" style={s.line} />
          </div>
        )}
      </div>
    </div>
  )
}
