import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { CreditCard, Loader2, DollarSign, AlertCircle, CheckCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { activateSubscriptionPlatformMor, getAgentPaymentMethods, setDefaultPaymentMethod } from '../api';
import { useAuth } from '@/components/Auth/Auth-context';
import { format, parseISO } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const PaymentDialog = ({
  open,
  onOpenChange,
  schedule,
  propertyId
}) => {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const currentUserNid = auth?.user?.neg_id;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Fetch payment methods
  const {
    data: paymentMethodsData,
    isLoading: paymentMethodsLoading
  } = useQuery({
    queryKey: ['agent-payment-methods', currentUserNid],
    queryFn: () => getAgentPaymentMethods(currentUserNid),
    enabled: open && !!currentUserNid
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: (paymentMethodId) => setDefaultPaymentMethod(currentUserNid, { payment_method_id: paymentMethodId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-payment-methods', currentUserNid] });
      toast({
        title: 'Default Updated',
        description: 'Default payment method has been updated.',
      });
    },
    onError: (error) => {
      console.error('Failed to set default payment method:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update default payment method.',
      });
    }
  });

  const activateMutation = useMutation({
    mutationFn: () => activateSubscriptionPlatformMor(schedule.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-schedules', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-schedules-summary', propertyId] });

      const totalAmount = data?.data?.total_amount || (weeklyRate * (schedule?.week_no || 0));

      toast({
        title: 'Subscription Activated!',
        description: `Subscription active. Total amount: £${totalAmount.toFixed(2)}`,
      });

      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to activate subscription:', error);

      toast({
        variant: 'destructive',
        title: 'Activation Failed',
        description: error?.response?.data?.error || 'Failed to activate subscription. Please try again.',
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    activateMutation.mutate();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSetDefault = (paymentMethodId) => {
    setDefaultMutation.mutate(paymentMethodId);
  };

  const paymentMethods = paymentMethodsData?.data || [];
  const hasPaymentMethod = paymentMethods.length > 0;
  const defaultPaymentMethod = paymentMethods.find(pm => pm.is_default);

  const weeklyRate = schedule?.fixed_week_rate || 0;
  const totalAmount = weeklyRate * (schedule?.week_no || 0);

  const isLoading = paymentMethodsLoading;

  // Can activate if has payment method
  const canActivate = hasPaymentMethod;

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

        <form onSubmit={handleSubmit} className="space-y-4">
          {schedule && (
            <div className="bg-gray-50 p-3 rounded-md text-sm space-y-2">
              <div className="font-medium">Subscription Details:</div>
              <div>Advertiser: {schedule.advertiser_company}</div>
              <div className="flex items-center justify-between">
                <span>Weekly Rate:</span>
                <span className="font-semibold">£{weeklyRate.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Duration:</span>
                <span className="font-semibold">{schedule.week_no} week{schedule.week_no !== 1 ? 's' : ''}</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  £{totalAmount.toFixed(2)}
                </span>
              </div>
              {schedule.start_date && (
                <div className="text-xs text-gray-600">
                  Billing starts: {format(parseISO(schedule.start_date), 'PPP')}
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Payment Methods */}
              {!hasPaymentMethod && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need to add a payment method before activating the subscription.
                    Visit Payment Settings to add one.
                  </AlertDescription>
                </Alert>
              )}

              {hasPaymentMethod && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Your Payment Methods:</div>
                  <div className="space-y-2">
                    {paymentMethods.map((pm) => (
                      <div
                        key={pm.id}
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer",
                          pm.is_default
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                        onClick={() => !pm.is_default && handleSetDefault(pm.id)}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <div>
                            <div className="text-sm font-medium capitalize">
                              {pm.card?.brand} •••• {pm.card?.last4}
                            </div>
                            <div className="text-xs text-gray-500">
                              Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                            </div>
                          </div>
                        </div>
                        {pm.is_default ? (
                          <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                            <Check className="h-4 w-4" />
                            Default
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(pm.id);
                            }}
                            disabled={setDefaultMutation.isPending}
                            className="text-xs"
                          >
                            Set as default
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {defaultPaymentMethod && (
                    <p className="text-xs text-gray-600 mt-2">
                      Default payment method will be charged for this subscription
                    </p>
                  )}
                </div>
              )}


              {/* Subscription Info */}
              {canActivate && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                  <div className="font-medium text-blue-800">What happens next:</div>
                  <ul className="text-blue-700 mt-1 space-y-1 text-xs list-disc list-inside">
                    <li>Subscription will be activated immediately</li>
                    <li>You'll be charged £{weeklyRate.toFixed(2)} per week for {schedule?.week_no} weeks</li>
                    <li>Billing starts on {schedule?.start_date && format(parseISO(schedule.start_date), 'PP')}</li>
                    <li>Total subscription cost: £{totalAmount.toFixed(2)}</li>
                    <li>Invoices will be generated and sent to you automatically</li>
                  </ul>
                </div>
              )}
            </>
          )}

          {activateMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {activateMutation.error?.response?.data?.error || 'Failed to activate subscription. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={activateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canActivate || activateMutation.isPending || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {activateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Activating...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Activate Subscription
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