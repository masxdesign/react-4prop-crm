import { CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PaymentActivationForm from '../ui/PaymentActivationForm';

const PaymentDialog = ({
  open,
  onOpenChange,
  schedule,
  propertyId
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col gap-0 p-0">
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Activate Subscription
          </DialogTitle>
          <DialogDescription>
            Activate subscription for {schedule?.advertiser_company}.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <PaymentActivationForm
            schedule={schedule}
            propertyId={propertyId}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;