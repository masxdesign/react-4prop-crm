import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Loader2, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { paySchedule } from '../api';

const PaymentDialog = ({ 
  open, 
  onOpenChange, 
  schedule, 
  propertyId 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const payMutation = useMutation({
    mutationFn: () => paySchedule(schedule.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-schedules', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-schedules-summary', propertyId] });
      onOpenChange(false);
      setPaymentMethod('');
      setNotes('');
    },
    onError: (error) => {
      console.error('Failed to process payment:', error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod) return;

    payMutation.mutate();
  };

  const handleClose = () => {
    onOpenChange(false);
    setPaymentMethod('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Payment
          </DialogTitle>
          <DialogDescription>
            Complete payment for {schedule?.advertiser_company} schedule.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {schedule && (
            <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
              <div className="font-medium">Payment Details:</div>
              <div>Advertiser: {schedule.advertiser_company}</div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold text-green-600">
                  Amount: £{schedule.quote?.toFixed(2)}
                </span>
              </div>
              <div>Duration: {schedule.week_no} week{schedule.week_no !== 1 ? 's' : ''}</div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="debit-card">Debit Card</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="stripe">Stripe (Future)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Notes (Optional)</Label>
            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any payment notes..."
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm">
            <div className="font-medium text-yellow-800">Note:</div>
            <div className="text-yellow-700">
              This is a demo payment form. Stripe integration will be added later.
              Submitting will mark the schedule as paid.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={payMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!paymentMethod || payMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {payMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;