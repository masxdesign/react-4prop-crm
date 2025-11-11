import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AgentEmailSearchField from '../ui/AgentEmailSearchField';
import { assignApprover } from '../api';

const AssignApproverDialog = ({ 
  open, 
  onOpenChange, 
  schedule, 
  propertyId 
}) => {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      approver_id: null
    }
  });

  const selectedApproverId = watch('approver_id');

  const assignMutation = useMutation({
    mutationFn: (data) => assignApprover(schedule.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-schedules', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-schedules-summary', propertyId] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      console.error('Failed to assign approver:', error);
    }
  });

  const onSubmit = (data) => {
    if (!data.approver_id) return;

    assignMutation.mutate({
      approver_id: data.approver_id
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
            <UserCheck className="h-5 w-5" />
            Assign Approver
          </DialogTitle>
          <DialogDescription>
            Select an agent to approve this schedule for {schedule?.advertiser_company}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <AgentEmailSearchField
              name="approver_id"
              control={control}
              rules={{
                required: "Please select an approver"
              }}
              label="Search for Approver"
              placeholder="Search by firstname, surname, email, or company"
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedApproverId || assignMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign Approver
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignApproverDialog;