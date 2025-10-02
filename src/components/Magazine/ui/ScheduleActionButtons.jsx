// React is available globally - no need to import
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/Auth/Auth-context';
import { Button } from '@/components/ui/button';
import { approveSchedule } from '@/components/Magazine/api';
import { CheckCircle, CreditCard, Loader2, UserPlus } from 'lucide-react';
import AssignApproverDialog from '../dialogs/AssignApproverDialog';
import ApprovalDialog from '../dialogs/ApprovalDialog';
import PaymentDialog from '../dialogs/PaymentDialog';

const ScheduleActionButtons = ({ schedule, propertyId, className, ...props }) => {
  const auth = useAuth();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  if (schedule.expired) return null // can not be expired
  
  const currentUserNid = auth?.user?.neg_id;
  
  // Determine which buttons to show based on user role and schedule status
  // Using hybrid approach: check both field presence AND status_id for maximum reliability
  const showAssignButton = () => {
    return (
      !schedule.approver_id && // No approver assigned yet
      schedule.agent_id === currentUserNid && // Current user is the creator
      schedule.status_id === 0 // Status allows assignment
    );
  };

  const showApproveButton = () => {
    return (
      schedule.approver_id === currentUserNid && // Current user is the assigned approver
      !schedule.approved_at && // Not already approved
      schedule.status_id === 1 // Status is pending approval
    );
  };

  const showPayButton = () => {
    return (
      schedule.payer_id === currentUserNid && // Current user is the assigned payer
      schedule.approved_at && // Schedule has been approved
      !schedule.paid_at && // Not already paid
      schedule.status_id === 2 // Status is pending payment
    );
  };

  // Don't render anything if no buttons should be shown
  if (!showAssignButton() && !showApproveButton() && !showPayButton()) {
    return null;
  }

  return (
    <>
      <div className={`flex gap-2 ${className}`} {...props}>
        {showAssignButton() && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAssignDialog(true)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Assign
          </Button>
        )}
        
        {showApproveButton() && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowApprovalDialog(true)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
        )}
        
        {showPayButton() && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPaymentDialog(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Pay
          </Button>
        )}
      </div>

      <AssignApproverDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        schedule={schedule}
        propertyId={propertyId}
      />

      <ApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        schedule={schedule}
        propertyId={propertyId}
      />

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        schedule={schedule}
        propertyId={propertyId}
      />
    </>
  );
};

export default ScheduleActionButtons;