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
// Inline Lucide SVG paths keyed by category — MIT license, lucide.dev
// Each value is the inner path/shape elements for a 24×24 viewBox SVG.
const CATEGORY_SVG = {
  museum:               '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  park:                 '<path d="M12 22v-7"/><path d="M17.5 12c0-4.7-2.4-8-5.5-8S6.5 7.3 6.5 12"/><path d="M5 20.5h14"/><path d="M5 16.5c.9.4 2.4.7 4.5.7 3 0 5-1 5-1s2 1 4.5 1"/><path d="M5 12.5c.9.3 2.4.5 4.5.5 3 0 5-1 5-1s2 1 4.5 1"/>',
  landmark:             '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  flagship_retail:      '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2V7"/>',
  supermarket:          '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  health_club:          '<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/>',
  health_club_branded:  '<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/>',
  health_club_generic:  '<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/>',
  theatre:              '<path d="M2 10s3-3 3-8"/><path d="M22 10s-3-3-3-8"/><path d="M10 2c0 4.4-3.6 8-8 8"/><path d="M14 2c0 4.4 3.6 8 8 8"/><path d="M2 10s2 2 2 5"/><path d="M22 10s-2 2-2 5"/><path d="M8 15h8"/><path d="M2 22v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1"/>',
  airport:              '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L11 10 2.8 8.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 15l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 4.5 6.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  shopping:             '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  poi:                  '<path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>',
  attraction:           '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  historic:             '<path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/><path d="M18 11V4H6v7"/><path d="M15 22v-4a3 3 0 0 0-3-3a3 3 0 0 0-3 3v4"/><path d="M22 11V9"/><path d="M2 11V9"/><path d="M6 4V2"/><path d="M18 4V2"/><path d="M10 4V2"/><path d="M14 4V2"/>',
  default:              '<path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>',
}

function iconSvg(category) {
  const paths = CATEGORY_SVG[category] || CATEGORY_SVG.default
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

export function buildOverlayHtml({ imageUrl, street, city, postcode, categories = [] }, variant = 'full') {
  const src = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}/${imageUrl}`
  const uniqueCategories = [...new Set(categories)]

  const iconsHtml = uniqueCategories.length > 0
    ? `\n  <div class="fio-icons">\n${uniqueCategories.map((cat) => `    ${iconSvg(cat)}`).join('\n')}\n  </div>`
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
