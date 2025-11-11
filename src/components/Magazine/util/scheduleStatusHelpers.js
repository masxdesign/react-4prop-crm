// Status ID constants
export const STATUS_IDS = {
  NO_APPROVER: 0,
  WAITING_APPROVAL: 1,
  APPROVED_WAITING_ACTIVATION: 2,
  ACTIVE: 3,
  CANCELLED: 4,
  COMPLETED: 5,
  EXPIRED: 6,
  SCHEDULED: 7
};

// Status display configurations
const STATUS_CONFIGS = {
  [STATUS_IDS.NO_APPROVER]: {
    label: 'No Approver',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴'
  },
  [STATUS_IDS.WAITING_APPROVAL]: {
    label: 'Waiting for Approval',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡'
  },
  [STATUS_IDS.APPROVED_WAITING_ACTIVATION]: {
    label: 'Approved - Awaiting Activation',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🟣'
  },
  [STATUS_IDS.ACTIVE]: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢'
  },
  [STATUS_IDS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🟠'
  },
  [STATUS_IDS.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅'
  },
  [STATUS_IDS.EXPIRED]: {
    label: 'Expired/Missed',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '⚫'
  },
  [STATUS_IDS.SCHEDULED]: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🔵'
  }
};

/**
 * Determines the effective status_id based on schedule state and timestamps
 * @param {Object} schedule - The schedule object
 * @returns {number} The effective status_id
 */
export const getEffectiveStatusId = (schedule) => {
  // Priority: cancelled > completed > active > expired > scheduled > workflow status

  if (schedule.cancelled_at) {
    return STATUS_IDS.CANCELLED;
  }

  if (schedule.completed_at) {
    return STATUS_IDS.COMPLETED;
  }

  if (schedule.active) {
    return STATUS_IDS.ACTIVE;
  }

  if (schedule.expired) {
    return STATUS_IDS.EXPIRED;
  }

  if (schedule.upcoming) {
    return STATUS_IDS.SCHEDULED;
  }

  // Fallback to database status_id for workflow states
  return schedule.status_id ?? STATUS_IDS.NO_APPROVER;
};

/**
 * Get the display configuration for a schedule's status
 * @param {Object} schedule - The schedule object
 * @returns {Object} Object with label, color (Tailwind classes), and icon
 */
export const getScheduleStatusDisplay = (schedule) => {
  const effectiveStatusId = getEffectiveStatusId(schedule);

  return STATUS_CONFIGS[effectiveStatusId] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '❓'
  };
};
