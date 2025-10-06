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
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProcessSettlementsDialog = ({ isOpen, onClose, onConfirm, isProcessing, result }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isProcessing ? 'Processing Settlements...' : result ? 'Settlement Results' : 'Process All Settlements'}
          </DialogTitle>
          <DialogDescription>
            {isProcessing
              ? 'Checking all pending transfers older than 7 days...'
              : result
              ? 'Settlement processing completed'
              : 'This will check all pending transfers older than 7 days'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isProcessing ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">
                  Checking transfer statuses with Stripe...
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{result.processed}</div>
                  <div className="text-xs text-gray-600 mt-1">Processed</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{result.settled}</div>
                  <div className="text-xs text-gray-600 mt-1">Settled</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{result.failed}</div>
                  <div className="text-xs text-gray-600 mt-1">Failed</div>
                </div>
              </div>

              {result.settled > 0 && (
                <Alert>
                  <AlertDescription>
                    ✅ {result.settled} {result.settled === 1 ? 'transfer has' : 'transfers have'} been
                    settled and self-billing invoices have been created.
                  </AlertDescription>
                </Alert>
              )}

              {result.failed > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    ⚠️ {result.failed} {result.failed === 1 ? 'transfer' : 'transfers'} failed during
                    processing. Please investigate manually.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  This will check all pending transfers that are older than 7 days with Stripe to determine
                  if they have settled.
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">What happens:</span>
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Checks each pending transfer with Stripe API</li>
                  <li>Creates self-billing invoices for settled transfers</li>
                  <li>Updates transfer status in the database</li>
                  <li>Refreshes the dashboard statistics</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">⚠️ Note:</span> This process may take a few seconds
                  depending on the number of pending transfers.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={onClose}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Process Settlements'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessSettlementsDialog;
