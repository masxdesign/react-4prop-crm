import { formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Get status color and variant based on transfer state
 * @param {number} daysPending - Days since transfer creation
 * @param {number} attempts - Number of settlement check attempts
 * @param {boolean} needsAttention - Backend flag
 * @returns {Object} Color configuration for UI elements
 */
export const getTransferStatusColor = (daysPending, attempts, needsAttention = false) => {
  // Critical: needs attention OR > 14 days OR > 5 attempts
  if (needsAttention || daysPending > 14 || attempts > 5) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      badge: 'destructive',
      indicator: '🔴'
    };
  }

  // Warning: 7-14 days OR > 3 attempts
  if ((daysPending >= 7 && daysPending <= 14) || attempts > 3) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      badge: 'outline',
      indicator: '⚠️'
    };
  }

  // Normal: < 7 days
  return {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'secondary',
    indicator: '🟢'
  };
};

/**
 * Format relative time from ISO timestamp
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Never';

  try {
    const date = parseISO(isoString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Date parsing error:', error);
    return 'N/A';
  }
};

/**
 * Get Stripe dashboard URL for a transfer
 * @param {string} transferId - Stripe transfer ID (tr_xxx)
 * @param {boolean} isTestMode - Whether in test mode
 * @returns {string} Stripe dashboard URL
 */
export const getStripeTransferUrl = (transferId, isTestMode = true) => {
  const mode = isTestMode ? 'test' : '';
  return `https://dashboard.stripe.com/${mode}/connect/transfers/${transferId}`;
};

/**
 * Get Stripe dashboard URL for a charge
 * @param {string} chargeId - Stripe charge ID (ch_xxx)
 * @param {boolean} isTestMode - Whether in test mode
 * @returns {string} Stripe dashboard URL
 */
export const getStripeChargeUrl = (chargeId, isTestMode = true) => {
  const mode = isTestMode ? 'test' : '';
  return `https://dashboard.stripe.com/${mode}/payments/${chargeId}`;
};

/**
 * Determine if a transfer needs urgent attention
 * @param {number} daysPending - Days since transfer creation
 * @param {number} attempts - Number of settlement attempts
 * @returns {boolean} Whether transfer needs attention
 */
export const needsAttention = (daysPending, attempts) => {
  return daysPending > 14 || attempts > 5;
};

/**
 * Get status text for transfer
 * @param {number} daysPending - Days since transfer creation
 * @returns {string} Status description
 */
export const getStatusText = (daysPending) => {
  if (daysPending === 0) return 'Just created';
  if (daysPending === 1) return '1 day pending';
  if (daysPending < 7) return `${daysPending} days (normal)`;
  if (daysPending <= 14) return `${daysPending} days (check soon)`;
  return `${daysPending} days (urgent)`;
};
