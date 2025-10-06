import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFailedTransfers } from '../api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '../util/formatCurrency';
import { formatRelativeTime, getStripeTransferUrl } from '../util/transferHelpers';

const FailedTransfersTable = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['failed-transfers'],
    queryFn: fetchFailedTransfers,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load failed transfers: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const transfers = data?.data || [];
  const count = data?.count || 0;

  if (count === 0) {
    return null; // Don't show section if no failed transfers
  }

  return (
    <div className="bg-white rounded-lg border-2 border-red-300 shadow-sm">
      {/* Alert Banner */}
      <div className="bg-red-50 border-b-2 border-red-300 px-6 py-4">
        <Alert variant="destructive" className="border-0 bg-transparent p-0">
          <AlertTitle className="text-lg font-semibold mb-2">
            ❌ Failed Transfers Detected
          </AlertTitle>
          <AlertDescription className="text-sm">
            {count} {count === 1 ? 'transfer has' : 'transfers have'} failed and require immediate attention.
            Please investigate with Stripe support.
          </AlertDescription>
        </Alert>
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">
          Failed Transfers ({count})
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Advertiser</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Transfer ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => {
              const stripeUrl = getStripeTransferUrl(transfer.stripe_transfer_id, true);

              return (
                <TableRow key={transfer.booking_item_id} className="bg-red-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{transfer.advertiser_name}</span>
                      <span className="text-xs text-gray-500">ID: {transfer.advertiser_id}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="destructive">Week {transfer.week_number}</Badge>
                  </TableCell>

                  <TableCell className="font-semibold">
                    {formatCurrency(transfer.transfer_amount_pounds)}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {formatRelativeTime(transfer.transfer_created_at)}
                  </TableCell>

                  <TableCell>
                    <a
                      href={stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-blue-600 hover:text-blue-800 underline"
                    >
                      {transfer.stripe_transfer_id}
                    </a>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => window.open(stripeUrl, '_blank')}
                    >
                      Investigate
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-red-50 border-t border-red-200">
        <p className="text-sm text-red-800">
          <span className="font-semibold">⚠️ Action Required:</span> Failed transfers indicate an issue
          with the Stripe transfer. Contact Stripe support with the transfer IDs above.
        </p>
      </div>
    </div>
  );
};

export default FailedTransfersTable;
