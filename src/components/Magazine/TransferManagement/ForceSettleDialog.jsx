import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '../util/formatCurrency';
import { getStripeTransferUrl } from '../util/transferHelpers';

const ForceSettleDialog = ({ isOpen, onClose, onConfirm, transfer }) => {
  if (!transfer) return null;

  const stripeUrl = getStripeTransferUrl(transfer.stripe_transfer_id, true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Force Settlement Check</DialogTitle>
          <DialogDescription>
            Manually check if this transfer has been settled with Stripe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-500">Advertiser</div>
              <div className="text-gray-900">{transfer.advertiser_name}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Week</div>
              <div className="text-gray-900">Week {transfer.week_number}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Amount</div>
              <div className="text-gray-900 font-semibold">
                {formatCurrency(transfer.transfer_amount_pounds)}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Days Pending</div>
              <div className="text-gray-900">{transfer.days_pending} days</div>
            </div>
            <div className="col-span-2">
              <div className="font-medium text-gray-500 mb-1">Stripe Transfer ID</div>
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs font-mono break-all underline"
              >
                {transfer.stripe_transfer_id}
              </a>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">What this does:</span> Checks with Stripe if this transfer
              has settled. If settled, creates a self-billing invoice and updates the status.
            </p>
          </div>

          {transfer.settlement_attempts > 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">⚠️ Note:</span> This transfer has been checked{' '}
                {transfer.settlement_attempts} times already. If it continues to be pending, contact Stripe support.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Check Settlement Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForceSettleDialog;
