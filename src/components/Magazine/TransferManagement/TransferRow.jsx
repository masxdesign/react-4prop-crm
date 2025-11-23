import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatCurrency } from '../util/formatCurrency';
import { getTransferStatusColor, formatRelativeTime, getStripeTransferUrl } from '../util/transferHelpers';
import { forceSettleTransfer } from '../api';
import { toast } from '@/components/ui/use-toast';
import ForceSettleDialog from './ForceSettleDialog';

const TransferRow = ({ transfer, onSettled }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const statusColor = getTransferStatusColor(
    transfer.days_pending,
    transfer.settlement_attempts,
    transfer.needs_attention
  );

  const settleMutation = useMutation({
    mutationFn: () => forceSettleTransfer(transfer.booking_item_id),
    onSuccess: (data) => {
      const isSettled = data?.data?.status === 'settled';

      toast({
        title: isSettled ? 'Transfer Settled!' : 'Settlement Check Complete',
        description: data?.message || (isSettled
          ? 'Transfer has been settled and invoice created.'
          : 'Transfer is still pending settlement.'),
        variant: isSettled ? 'default' : 'outline',
      });

      // Refresh both stats and pending transfers
      queryClient.invalidateQueries({ queryKey: ['transfer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });

      if (isSettled && onSettled) {
        onSettled(transfer.booking_item_id);
      }
    },
    onError: (error) => {
      toast({
        title: 'Settlement Check Failed',
        description: error?.response?.data?.message || error?.message || 'Failed to check settlement status',
        variant: 'destructive',
      });
    },
  });

  const handleForceSettle = () => {
    setIsDialogOpen(false);
    settleMutation.mutate();
  };

  return (
    <>
      <TableRow className={`${statusColor.bg} hover:opacity-90 transition-opacity`}>
        {/* Advertiser */}
        <TableCell className="font-medium">
          <div className="flex flex-col">
            <span className="text-sm">{transfer.advertiser_name}</span>
            <span className="text-xs text-gray-500">ID: {transfer.advertiser_id}</span>
          </div>
        </TableCell>

        {/* Week Number */}
        <TableCell>
          <Badge variant={statusColor.badge}>Week {transfer.week_number}</Badge>
        </TableCell>

        {/* Amount */}
        <TableCell className="font-semibold">
          {formatCurrency(transfer.transfer_amount_pounds)}
        </TableCell>

        {/* Days Pending */}
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="text-xl">{statusColor.indicator}</span>
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${statusColor.text}`}>
                {transfer.days_pending} days
              </span>
              {transfer.needs_attention && (
                <span className="text-xs text-red-600 font-semibold">Needs attention!</span>
              )}
            </div>
          </div>
        </TableCell>

        {/* Last Checked */}
        <TableCell className="text-sm text-gray-600">
          {formatRelativeTime(transfer.settlement_checked_at)}
        </TableCell>

        {/* Attempts */}
        <TableCell className="text-center">
          <span className={`font-medium ${transfer.settlement_attempts > 3 ? 'text-orange-600' : 'text-gray-700'}`}>
            {transfer.settlement_attempts}
          </span>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            disabled={settleMutation.isPending}
            className="hover:bg-blue-50 hover:border-blue-400"
          >
            {settleMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                Checking...
              </>
            ) : (
              'Force Settle'
            )}
          </Button>
        </TableCell>
      </TableRow>

      <ForceSettleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleForceSettle}
        transfer={transfer}
      />
    </>
  );
};

export default TransferRow;
