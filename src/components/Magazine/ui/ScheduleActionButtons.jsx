// React is available globally - no need to import
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/Auth/Auth-context';
import { Button } from '@/components/ui/button';
import { approveSchedule, paySchedule } from '@/components/Magazine/api';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';

const ScheduleActionButtons = ({ schedule, propertyId, className, ...props }) => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  
  const currentUserNid = auth?.user?.neg_id;
  
  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => approveSchedule(schedule.id),
    onSuccess: () => {
      // Invalidate and refetch schedule data
      queryClient.invalidateQueries({ queryKey: ['property-schedules', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-schedules-summary', propertyId] });
    },
    onError: (error) => {
      console.error('Failed to approve schedule:', error);
    }
  });

  // Pay mutation
  const payMutation = useMutation({
    mutationFn: () => paySchedule(schedule.id),
    onSuccess: () => {
      // Invalidate and refetch schedule data
      queryClient.invalidateQueries({ queryKey: ['property-schedules', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-schedules-summary', propertyId] });
    },
    onError: (error) => {
      console.error('Failed to complete payment:', error);
    }
  });

  // Determine which buttons to show based on user role and schedule status
  const showApproveButton = () => {
    return (
      schedule.status_id === 1 && // Waiting for approval
      schedule.approver_id === currentUserNid && // Current user is the assigned approver
      !schedule.approved_at // Not already approved
    );
  };

  const showPayButton = () => {
    return (
      schedule.status_id === 2 && // Waiting for payment
      schedule.payer_id === currentUserNid && // Current user is the assigned payer
      !schedule.paid_at // Not already paid
    );
  };

  // Don't render anything if no buttons should be shown
  if (!showApproveButton() && !showPayButton()) {
    return null;
  }

  return (
    <div className={`flex gap-2 ${className}`} {...props}>
      {showApproveButton() && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => approveMutation.mutate()}
          disabled={approveMutation.isPending}
          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
        >
          {approveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1" />
          )}
          Approve
        </Button>
      )}
      
      {showPayButton() && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => payMutation.mutate()}
          disabled={payMutation.isPending}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
        >
          {payMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <CreditCard className="h-4 w-4 mr-1" />
          )}
          Pay
        </Button>
      )}
    </div>
  );
};

export default ScheduleActionButtons;