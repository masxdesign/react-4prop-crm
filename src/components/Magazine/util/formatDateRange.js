import { format, parseISO, isSameMonth, isSameYear, isSameDay, isValid } from 'date-fns';

/**
 * Formats two dates into a compact, readable date range
 * @param {string|Date} startDate - Start date (ISO string or Date object)
 * @param {string|Date} endDate - End date (ISO string or Date object)
 * @param {Object} options - Configuration options
 * @param {boolean} options.compact - Ultra compact mode (default: false)
 * @param {boolean} options.showYear - Show year (default: true)
 * @param {string} options.separator - Range separator (default: ' - ')
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate, options = {}) => {
  const {
    compact = false,
    showYear = true,
    separator = ' - '
  } = options;

  try {
    // Parse dates - handle both ISO strings and Date objects
    let start, end;
    
    if (typeof startDate === 'string') {
      start = parseISO(startDate);
    } else if (startDate instanceof Date) {
      start = startDate;
    } else {
      return 'N/A';
    }

    if (typeof endDate === 'string') {
      end = parseISO(endDate);
    } else if (endDate instanceof Date) {
      end = endDate;
    } else {
      return 'N/A';
    }

    // Validate dates
    if (!isValid(start) || !isValid(end)) {
      return 'N/A';
    }

    // Same day - just show single date
    if (isSameDay(start, end)) {
      return showYear 
        ? format(start, 'MMM d, yyyy')
        : format(start, 'MMM d');
    }

    // Same month and year - optimize display
    if (isSameMonth(start, end) && isSameYear(start, end)) {
      const startDay = format(start, 'd');
      const endDay = format(end, 'd');
      const month = format(start, 'MMM');
      const year = format(start, 'yyyy');
      
      if (compact) {
        return showYear ? `${startDay}-${endDay} ${month} '${year.slice(-2)}` : `${startDay}-${endDay} ${month}`;
      } else {
        return showYear ? `${month} ${startDay}-${endDay}, ${year}` : `${month} ${startDay}-${endDay}`;
      }
    }

    // Same year but different months
    if (isSameYear(start, end)) {
      const startFormatted = format(start, 'MMM d');
      const endFormatted = format(end, 'MMM d');
      const year = format(start, 'yyyy');
      
      if (compact) {
        return showYear 
          ? `${startFormatted}${separator}${endFormatted} '${year.slice(-2)}`
          : `${startFormatted}${separator}${endFormatted}`;
      } else {
        return showYear 
          ? `${startFormatted}${separator}${endFormatted}, ${year}`
          : `${startFormatted}${separator}${endFormatted}`;
      }
    }

    // Different years - full format
    const startFormatted = showYear ? format(start, 'MMM d, yyyy') : format(start, 'MMM d');
    const endFormatted = showYear ? format(end, 'MMM d, yyyy') : format(end, 'MMM d');
    
    return `${startFormatted}${separator}${endFormatted}`;

  } catch (error) {
    // Fallback for any parsing errors
    console.warn('Date formatting error:', error);
    return 'N/A';
  }
};

export default formatDateRange;