import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/components/Auth/Auth';
import TransferStats from '@/components/Magazine/TransferManagement/TransferStats';
import ActionsBar from '@/components/Magazine/TransferManagement/ActionsBar';
import PendingTransfersTable from '@/components/Magazine/TransferManagement/PendingTransfersTable';
import FailedTransfersTable from '@/components/Magazine/TransferManagement/FailedTransfersTable';
import {
  fetchTransferStats,
  fetchPendingTransfers,
  fetchFailedTransfers,
} from '@/components/Magazine/api';

export const Route = createFileRoute('/_auth/_dashboard/mag/transfers')({
  beforeLoad: ({ context }) => {
    // Create query options for preloading
    const statsQueryOptions = {
      queryKey: ['transfer-stats'],
      queryFn: fetchTransferStats,
    };

    const pendingQueryOptions = {
      queryKey: ['pending-transfers'],
      queryFn: fetchPendingTransfers,
    };

    const failedQueryOptions = {
      queryKey: ['failed-transfers'],
      queryFn: fetchFailedTransfers,
    };

    return {
      ...context,
      transferStatsQueryOptions: statsQueryOptions,
      pendingTransfersQueryOptions: pendingQueryOptions,
      failedTransfersQueryOptions: failedQueryOptions,
    };
  },
  loader: async ({ context }) => {
    // Preload all data in parallel
    await Promise.all([
      context.queryClient.ensureQueryData(context.transferStatsQueryOptions),
      context.queryClient.ensureQueryData(context.pendingTransfersQueryOptions),
      context.queryClient.ensureQueryData(context.failedTransfersQueryOptions),
    ]);

    return null;
  },
  pendingComponent: () => (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-700 font-medium">Loading transfers...</span>
      </div>
    </div>
  ),
  component: TransferSettlementDashboard,
});

function TransferSettlementDashboard() {
  const auth = useAuth();
  
  // Check if user is admin (adjust this based on your auth structure)
  const isAdmin = auth.user?.role === 'admin' || auth.user?.is_admin;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">
            You do not have permission to view transfer settlement data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Transfer Settlement Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Platform MoR Transfer Monitoring & Settlement Management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                User: <span className="font-medium">{auth.user?.name || auth.user?.email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <TransferStats />

          {/* Actions Bar */}
          <ActionsBar />

          {/* Failed Transfers Alert */}
          <FailedTransfersTable />

          {/* Pending Transfers Table */}
          <PendingTransfersTable />

          {/* Info Footer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">About Transfer Settlements</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Transfers typically take 2-7 days to settle (Stripe processing time)</li>
                  <li>Self-billing invoices are created automatically when transfers settle</li>
                  <li>Cron job runs daily at 2 AM to check settlements (automatic)</li>
                  <li>Manual force settle checks individual transfer status</li>
                  <li>Process all settlements checks transfers older than 7 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
