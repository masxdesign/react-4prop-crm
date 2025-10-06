/**
 * Platform MoR Helper Utilities
 * Functions for commission calculations and Platform MoR business logic
 */

/**
 * Calculate commission breakdown for Platform MoR
 * @param {number} totalAmount - Total subscription amount
 * @param {number} commissionPercent - Commission percentage (e.g., 50)
 * @returns {Object} Breakdown of amounts
 */
export const calculateCommissionBreakdown = (totalAmount, commissionPercent = 50) => {
  const total = parseFloat(totalAmount) || 0;
  const percent = parseFloat(commissionPercent) || 50;

  const commissionAmount = (total * percent) / 100;
  const advertiserAmount = total - commissionAmount;

  return {
    total,
    commissionPercent: percent,
    commissionAmount,
    advertiserAmount
  };
};

/**
 * Format commission display text
 * @param {number} commissionPercent - Commission percentage
 * @returns {string} Formatted text (e.g., "50% Platform Commission")
 */
export const formatCommissionText = (commissionPercent) => {
  return `${commissionPercent}% Platform Commission`;
};

/**
 * Check if Platform MoR is active for a schedule
 * @param {Object} schedule - Schedule object
 * @returns {boolean} True if Platform MoR
 */
export const isPlatformMor = (schedule) => {
  return schedule?.platform_mor === true;
};

/**
 * Get Platform MoR badge config
 * @param {Object} schedule - Schedule object
 * @returns {Object|null} Badge configuration or null
 */
export const getPlatformMorBadgeConfig = (schedule) => {
  if (!isPlatformMor(schedule)) return null;

  return {
    label: 'Platform MoR',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    tooltip: 'BizChat collects payment and transfers to advertiser after commission'
  };
};

/**
 * Validate Platform MoR requirements
 * @param {Object} schedule - Schedule object
 * @param {Object} advertiserStatus - Advertiser Stripe status
 * @param {Object} paymentMethods - Payer payment methods
 * @returns {Object} Validation result with blockers
 */
export const validatePlatformMorRequirements = (schedule, advertiserStatus, paymentMethods) => {
  const blockers = [];

  // Schedule validation
  if (!schedule?.approved_at) {
    blockers.push({
      key: 'schedule_not_approved',
      message: 'Schedule needs approval first',
      action: 'Approve Schedule'
    });
  }

  if (!schedule?.payer_id) {
    blockers.push({
      key: 'no_payer',
      message: 'No payer assigned to schedule',
      action: 'Assign Payer'
    });
  }

  if (schedule?.subscription_schedule_id) {
    blockers.push({
      key: 'already_active',
      message: 'Subscription already activated',
      action: null
    });
  }

  // Advertiser validation
  if (!advertiserStatus?.onboarding_completed) {
    blockers.push({
      key: 'advertiser_not_onboarded',
      message: 'Advertiser has not completed Stripe onboarding',
      action: 'Complete Onboarding'
    });
  }

  if (!advertiserStatus?.self_billing_agreement) {
    blockers.push({
      key: 'no_self_billing',
      message: 'Advertiser must accept self-billing agreement',
      action: 'Accept Agreement'
    });
  }

  // Payer validation
  if (!paymentMethods || paymentMethods.length === 0) {
    blockers.push({
      key: 'no_payment_method',
      message: 'Payment method required',
      action: 'Add Payment Method'
    });
  }

  return {
    canActivate: blockers.length === 0,
    blockers
  };
};

/**
 * Get user-friendly error message for Platform MoR errors
 * @param {string} errorCode - Error code from API
 * @returns {Object} Error message and action
 */
export const getPlatformMorErrorMessage = (errorCode) => {
  const errorMap = {
    'self_billing_required': {
      message: 'Advertiser must accept self-billing agreement before Platform MoR activation',
      action: 'Accept Agreement',
      severity: 'warning'
    },
    'advertiser_no_stripe': {
      message: 'Advertiser does not have a Stripe account configured',
      action: 'Setup Stripe',
      severity: 'error'
    },
    'advertiser_not_onboarded': {
      message: 'Advertiser has not completed Stripe onboarding',
      action: 'Complete Onboarding',
      severity: 'error'
    },
    'payer_no_stripe': {
      message: 'Payer does not have a Stripe customer account',
      action: 'Setup Payment',
      severity: 'error'
    },
    'schedule_not_approved': {
      message: 'Schedule must be approved before subscription can be activated',
      action: 'Approve Schedule',
      severity: 'warning'
    },
    'no_payer_assigned': {
      message: 'Schedule must have a payer assigned',
      action: 'Assign Payer',
      severity: 'warning'
    },
    'already_activated': {
      message: 'Subscription has already been activated for this schedule',
      action: null,
      severity: 'info'
    }
  };

  return errorMap[errorCode] || {
    message: 'An unexpected error occurred',
    action: null,
    severity: 'error'
  };
};

export default {
  calculateCommissionBreakdown,
  formatCommissionText,
  isPlatformMor,
  getPlatformMorBadgeConfig,
  validatePlatformMorRequirements,
  getPlatformMorErrorMessage
};
