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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Activate Subscription
          </DialogTitle>
          <DialogDescription>
            Activate subscription for {schedule?.advertiser_company}.
          </DialogDescription>
        </DialogHeader>

        <PaymentActivationForm
          schedule={schedule}
          propertyId={propertyId}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;