import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { CreditCard, Loader2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { activateSubscription, getAgentPaymentMethods, getAdvertiserStripeStatus } from '../api';
import { useAuth } from '@/components/Auth/Auth-context';
import { format, parseISO } from 'date-fns';

const PaymentDialog = ({
  open,
  onOpenChange,
  schedule,
  propertyId
}) => {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const currentUserNid = auth?.user?.neg_id;

  // Check if payer has payment methods
  const {
    data: paymentMethodsData,
    isLoading: paymentMethodsLoading
  } = useQuery({
    queryKey: ['agent-payment-methods', currentUserNid],
    queryFn: () => getAgentPaymentMethods(currentUserNid),
    enabled: open && !!currentUserNid && schedule?.payer_id === currentUserNid
  });

  // Check advertiser onboarding status
  const {
    data: advertiserStatusData,
    isLoading: advertiserStatusLoading
  } = useQuery({
    queryKey: ['advertiser-stripe-status', schedule?.advertiser_id],
    queryFn: () => getAdvertiserStripeStatus(schedule?.advertiser_id),
    enabled: open && !!schedule?.advertiser_id
  });

  const activateMutation = useMutation({
    mutationFn: () => activateSubscription(schedule.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-schedules', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-schedules-summary', propertyId] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to activate subscription:', error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    activateMutation.mutate();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const paymentMethods = paymentMethodsData?.data || [];
  const hasPaymentMethod = paymentMethods.length > 0;
  const advertiserStatus = advertiserStatusData?.data;
  const advertiserOnboarded = advertiserStatus?.onboarding_completed;

  const weeklyRate = schedule?.fixed_week_rate || 0;
  const totalAmount = weeklyRate * (schedule?.week_no || 0);

  const isLoading = paymentMethodsLoading || advertiserStatusLoading;

  // Check for blockers
  const canActivate = hasPaymentMethod && advertiserOnboarded;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Activate Subscription
          </DialogTitle>
          <DialogDescription>
            Activate weekly subscription for {schedule?.advertiser_company}.
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
              {/* Payment Method Status */}
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
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Payment method configured ({paymentMethods[0]?.card?.brand} ****{paymentMethods[0]?.card?.last4})
                  </AlertDescription>
                </Alert>
              )}

              {/* Advertiser Onboarding Status */}
              {!advertiserOnboarded && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The advertiser has not completed Stripe onboarding. Please ask them to complete onboarding first.
                  </AlertDescription>
                </Alert>
              )}

              {advertiserOnboarded && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Advertiser onboarding complete
                  </AlertDescription>
                </Alert>
              )}

              {/* Subscription Info */}
              {canActivate && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                  <div className="font-medium text-blue-800">What happens next:</div>
                  <ul className="text-blue-700 mt-1 space-y-1 text-xs list-disc list-inside">
                    <li>Subscription will be activated immediately</li>
                    <li>Weekly billing starts on {schedule?.start_date && format(parseISO(schedule.start_date), 'PP')}</li>
                    <li>You'll be charged £{weeklyRate.toFixed(2)} per week for {schedule?.week_no} weeks</li>
                    <li>Payments are processed automatically via Stripe</li>
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