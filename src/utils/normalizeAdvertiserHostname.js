/**
 * Apex host only: strips leading `www.` (e.g. www.example.com → example.com).
 * @param {string} hostname lowercased, no trailing dot
 * @returns {string}
 */
function stripWwwPrefix(hostname) {
  const h = hostname.replace(/\.$/, '').toLowerCase();
  return h.startsWith('www.') ? h.slice(4) : h;
}

/**
 * Normalize advertiser "hostname" to apex domain only (HTTPS assumed by callers).
 * Strips protocol, credentials, path, query, fragment; lowercases; trims trailing dot; strips `www.`.
 *
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeAdvertiserHostname(raw) {
  if (raw == null) return '';
  let s = String(raw).trim();
  if (!s) return '';

  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (u.hostname) {
      return stripWwwPrefix(u.hostname);
    }
  } catch {
    // fall through
  }

  s = s.replace(/^https?:\/\//i, '');
  const cut = s.search(/[/?#]/);
  if (cut !== -1) s = s.slice(0, cut);
  const at = s.lastIndexOf('@');
  if (at !== -1) s = s.slice(at + 1);
  s = s.replace(/\.+$/, '');
  s = s.replace(/:443$|:80$/i, '');
  return stripWwwPrefix(s.trim());
}

const LABEL = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

/**
 * Apex domain only: exactly two labels (e.g. example.com). Rejects subdomains and multi-part TLDs (e.g. example.co.uk).
 * @param {string} hostname normalized (ASCII / punycode from URL parser)
 * @returns {boolean}
 */
export function isValidAdvertiserHostname(hostname) {
  if (!hostname || hostname.length > 253) return false;
  const labels = hostname.split('.');
  if (labels.length !== 2) return false;
  return labels.every((label) => label.length > 0 && LABEL.test(label));
}

/**
 * react-hook-form validate: empty allowed; otherwise apex domain only.
 * @param {unknown} raw
 * @returns {true|string}
 */
export function validateAdvertiserHostnameField(raw) {
  const n = normalizeAdvertiserHostname(raw);
  if (!n) return true;
  if (!isValidAdvertiserHostname(n)) {
    return 'Use the apex domain only (e.g. example.com). No www, subdomains, or https:// — pasted URLs are trimmed.';
  }
  return true;
}
