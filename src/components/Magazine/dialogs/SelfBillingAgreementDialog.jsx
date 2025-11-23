import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { acceptSelfBillingAgreement } from '../api';

const SelfBillingAgreementDialog = ({
  open,
  onOpenChange,
  advertiserId,
  advertiserName,
  onAccepted
}) => {
  const [agreed, setAgreed] = useState(false);
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => acceptSelfBillingAgreement(advertiserId),
    onSuccess: () => {
      // Invalidate advertiser status to refresh self-billing flag
      queryClient.invalidateQueries({ queryKey: ['advertiser-stripe-status', advertiserId] });
      // Also invalidate the advertisers list (used in admin management)
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });

      if (onAccepted) {
        onAccepted();
      }

      // Close dialog
      onOpenChange(false);
      setAgreed(false);
    },
    onError: (error) => {
      console.error('Failed to accept self-billing agreement:', error);
    }
  });

  const handleAccept = () => {
    if (agreed) {
      acceptMutation.mutate();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setAgreed(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Self-Billing Agreement
          </DialogTitle>
          <DialogDescription>
            Required for Platform Merchant of Record (MoR) model
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              This is a one-time agreement required before your first Platform MoR subscription can be activated.
            </AlertDescription>
          </Alert>

          {/* Agreement Content */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Self-Billing Agreement Terms</h3>

            <div className="text-sm text-gray-700 space-y-3">
              <p>
                By accepting this agreement, <strong>{advertiserName}</strong> authorizes BizChat Ltd to:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Issue VAT invoices</strong> on your behalf for revenue share payments under UK VAT self-billing regulations
                </li>
                <li>
                  <strong>Collect payments</strong> from estate agents on your behalf as the Platform Merchant of Record
                </li>
                <li>
                  <strong>Deduct platform commission</strong> (as agreed in your advertiser terms) from collected payments
                </li>
                <li>
                  <strong>Transfer net proceeds</strong> to your connected Stripe account after commission deduction
                </li>
                <li>
                  <strong>Generate self-billing invoices</strong> showing the revenue share amount and applicable VAT
                </li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> You remain responsible for:
                </p>
                <ul className="list-disc list-inside mt-1 text-sm text-yellow-700 ml-2">
                  <li>Maintaining accurate VAT registration (if applicable)</li>
                  <li>Declaring self-billed invoice amounts in your VAT returns</li>
                  <li>Keeping records of all self-billing transactions</li>
                </ul>
              </div>

              <p className="text-xs text-gray-600 mt-4">
                This agreement complies with HMRC VAT Notice 700/62 regarding self-billing arrangements.
                You may revoke this agreement at any time, but doing so will prevent new Platform MoR subscriptions.
              </p>
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={setAgreed}
              disabled={acceptMutation.isPending}
            />
            <label
              htmlFor="agree"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and accept the self-billing agreement on behalf of {advertiserName}
            </label>
          </div>

          {/* Error Display */}
          {acceptMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {acceptMutation.error?.response?.data?.error || 'Failed to accept agreement. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={acceptMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!agreed || acceptMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {acceptMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept & Continue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelfBillingAgreementDialog;
