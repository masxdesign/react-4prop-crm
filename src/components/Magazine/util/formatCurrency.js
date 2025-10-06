/**
 * Formats a number or string amount as GBP currency
 * @param {number|string} amount - Amount in pounds (e.g., 60.00, "60.00")
 * @param {Object} options - Formatting options
 * @param {boolean} options.showSymbol - Show £ symbol (default: true)
 * @param {number} options.decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string (e.g., "£60.00")
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    showSymbol = true,
    decimals = 2
  } = options;

  if (amount === null || amount === undefined || amount === '') {
    return showSymbol ? '£0.00' : '0.00';
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return showSymbol ? '£0.00' : '0.00';
  }

  const formatted = numAmount.toFixed(decimals);

  return showSymbol ? `£${formatted}` : formatted;
};

/**
 * Formats pence amount as GBP currency
 * @param {number} pence - Amount in pence (e.g., 6000)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string (e.g., "£60.00")
 */
export const formatPence = (pence, options = {}) => {
  if (pence === null || pence === undefined) {
    return formatCurrency(0, options);
  }

  const pounds = pence / 100;
  return formatCurrency(pounds, options);
};

export default formatCurrency;
