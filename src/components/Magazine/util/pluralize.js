/**
 * Simple pluralization utility for Magazine module
 * @param {number} count - The count/number
 * @param {string} singular - Singular form of the word
 * @param {string|null} plural - Optional custom plural form
 * @returns {string} Formatted string with count and properly pluralized word
 */
export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || `${singular}s`}`;
};

// Magazine-specific helpers
export const pluralizeWeeks = (count) => pluralize(count, 'week');
export const pluralizeProperties = (count) => pluralize(count, 'property', 'properties');
export const pluralizeAdvertisers = (count) => pluralize(count, 'advertiser');