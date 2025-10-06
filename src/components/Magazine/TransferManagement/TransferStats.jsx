import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTransferStats } from '../api';
import { formatCurrency } from '../util/formatCurrency';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TransferStats = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['transfer-stats'],
    queryFn: fetchTransferStats,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load transfer statistics: {error?.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  const stats = data?.data || {
    pending: { count: 0, total_pounds: '0.00', avg_days: 0 },
    settled: { count: 0, total_pounds: '0.00', avg_days: 0 },
    failed: { count: 0, total_pounds: '0.00', avg_days: 0 }
  };

  const hasCriticalIssues = stats.pending.count > 10 || stats.failed.count > 0;

  return (
    <div className="space-y-4">
      {hasCriticalIssues && (
        <Alert variant="destructive">
          <AlertDescription>
            {stats.pending.count > 10 && `⚠️ High pending transfer count: ${stats.pending.count} transfers pending. `}
            {stats.failed.count > 0 && `⚠️ ${stats.failed.count} failed transfers require attention.`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Transfers */}
        <div className="bg-white p-6 rounded-lg border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending.count}</div>
            <div className="text-2xl">⏳</div>
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1">Pending Transfers</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.pending.total_pounds)}
          </div>
          <div className="text-xs text-gray-500">
            Avg: {stats.pending.avg_days} days
          </div>
        </div>

        {/* Settled Transfers */}
        <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-green-600">{stats.settled.count}</div>
            <div className="text-2xl">✅</div>
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1">Settled Transfers</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.settled.total_pounds)}
          </div>
          <div className="text-xs text-gray-500">
            Avg: {stats.settled.avg_days} days to settle
          </div>
        </div>

        {/* Failed Transfers */}
        <div className="bg-white p-6 rounded-lg border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-red-600">{stats.failed.count}</div>
            <div className="text-2xl">❌</div>
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1">Failed Transfers</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.failed.total_pounds)}
          </div>
          <div className="text-xs text-gray-500">
            {stats.failed.count > 0 ? 'Requires attention' : 'No failures'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferStats;
