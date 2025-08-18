import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AgentEmailSearchField from '../ui/AgentEmailSearchField';
import { approveSchedule } from '../api';

const ApprovalDialog = ({ 
  open, 
  onOpenChange, 
  schedule, 
  propertyId 
}) => {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      payer_id: null
    }
  });

  const selectedPayerId = watch('payer_id');

  const approveMutation = useMutation({
    mutationFn: (data) => approveSchedule(schedule.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-schedules', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-schedules-summary', propertyId] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      console.error('Failed to approve schedule:', error);
    }
  });

  const onSubmit = (data) => {
    if (!data.payer_id) return;

    approveMutation.mutate({
      payer_id: data.payer_id
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Approve Schedule
          </DialogTitle>
          <DialogDescription>
            Select who will be responsible for payment of this schedule for {schedule?.advertiser_company}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <AgentEmailSearchField
              name="payer_id"
              control={control}
              rules={{
                required: "Please select a payer"
              }}
              label="Choose Payer"
              placeholder="Search by email..."
              className="w-full"
            />
          </div>

          {schedule && (
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <div className="font-medium">Schedule Details:</div>
              <div>Advertiser: {schedule.advertiser_company}</div>
              <div>Quote: £{schedule.quote?.toFixed(2)}</div>
              <div>Duration: {schedule.week_no} week{schedule.week_no !== 1 ? 's' : ''}</div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
            <div className="font-medium text-blue-800">Approval Action:</div>
            <div className="text-blue-700">
              Approving this schedule will set the approval date and assign the selected agent as the payer.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedPayerId || approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Assign Payer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;