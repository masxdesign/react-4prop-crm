import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPendingTransfers } from '../api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TransferRow from './TransferRow';

const PendingTransfersTable = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pending-transfers'],
    queryFn: fetchPendingTransfers,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load pending transfers: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const transfers = data?.data || [];
  const count = data?.count || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Transfers
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {count === 0 ? 'No pending transfers' : `${count} ${count === 1 ? 'transfer' : 'transfers'} awaiting settlement`}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {count === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All Clear!
          </h3>
          <p className="text-gray-600">
            No pending transfers at the moment. All transfers have been settled.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Advertiser</TableHead>
                <TableHead className="w-[100px]">Week</TableHead>
                <TableHead className="w-[120px]">Amount</TableHead>
                <TableHead className="w-[140px]">Days Pending</TableHead>
                <TableHead className="w-[140px]">Last Checked</TableHead>
                <TableHead className="w-[100px] text-center">Attempts</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TransferRow
                  key={transfer.booking_item_id}
                  transfer={transfer}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer Info */}
      {count > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">🟢</span>
              <span>Normal (&lt; 7 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>Warning (7-14 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔴</span>
              <span>Critical (&gt; 14 days)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTransfersTable;
