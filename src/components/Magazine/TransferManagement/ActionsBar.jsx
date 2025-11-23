import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { processAllSettlements } from '../api';
import { toast } from '@/components/ui/use-toast';
import ProcessSettlementsDialog from './ProcessSettlementsDialog';

const ActionsBar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const processMutation = useMutation({
    mutationFn: processAllSettlements,
    onSuccess: (data) => {
      setResult(data?.data || { processed: 0, settled: 0, failed: 0 });

      toast({
        title: 'Settlement Processing Complete',
        description: `Processed ${data?.data?.processed || 0} transfers, ${data?.data?.settled || 0} settled.`,
      });

      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ['transfer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['failed-transfers'] });
    },
    onError: (error) => {
      toast({
        title: 'Processing Failed',
        description: error?.response?.data?.message || error?.message || 'Failed to process settlements',
        variant: 'destructive',
      });
      setIsDialogOpen(false);
      setResult(null);
    },
  });

  const handleProcessClick = () => {
    setResult(null);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    processMutation.mutate();
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setResult(null);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['transfer-stats'] });
    queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
    queryClient.invalidateQueries({ queryKey: ['failed-transfers'] });

    toast({
      title: 'Refreshed',
      description: 'Transfer data has been refreshed',
    });
  };

  return (
    <>
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">
            Auto-refresh enabled (every 60 seconds)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Now
          </Button>

          <Button
            size="sm"
            onClick={handleProcessClick}
            disabled={processMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Process All Settlements
              </>
            )}
          </Button>
        </div>
      </div>

      <ProcessSettlementsDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        isProcessing={processMutation.isPending}
        result={result}
      />
    </>
  );
};

export default ActionsBar;
