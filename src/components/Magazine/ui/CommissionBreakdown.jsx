import React from 'react';
import { TrendingDown } from 'lucide-react';
import { formatCurrency } from '../util/formatCurrency';
import { calculateCommissionBreakdown } from '../util/platformMorHelpers';

const CommissionBreakdown = ({ totalAmount, commissionPercent = 50, compact = false }) => {
  const breakdown = calculateCommissionBreakdown(totalAmount, commissionPercent);

  if (compact) {
    return (
      <div className="text-xs text-gray-600">
        <span className="font-medium">{formatCurrency(breakdown.advertiserAmount)}</span>
        {' '}to advertiser
        {' '}({commissionPercent}% commission)
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="h-4 w-4 text-indigo-600" />
        <h4 className="font-semibold text-indigo-900 text-sm">Commission Breakdown</h4>
      </div>

      <div className="space-y-2">
        {/* Total Amount */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Total Amount:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(breakdown.total)}</span>
        </div>

        {/* Platform Commission */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Platform Commission ({commissionPercent}%):</span>
          <span className="font-semibold text-orange-600">
            - {formatCurrency(breakdown.commissionAmount)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-indigo-200 my-2"></div>

        {/* Advertiser Receives */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Advertiser Receives:</span>
          <span className="font-bold text-green-600 text-lg">
            {formatCurrency(breakdown.advertiserAmount)}
          </span>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-3 pt-3 border-t border-indigo-200">
        <p className="text-xs text-indigo-700">
          <span className="font-semibold">Self-Billing:</span> Platform issues invoices on behalf of advertiser
        </p>
      </div>
    </div>
  );
};

export default CommissionBreakdown;
