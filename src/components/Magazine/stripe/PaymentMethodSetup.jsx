import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setupAgentPayment } from '../api';
import getStripe from '@/lib/stripe';

// Payment form component (must be child of Elements)
const PaymentForm = ({ clientSecret, onSuccess, onCancel, agentNid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/crm/mag/payment-settings?setup=complete`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message);
        setIsProcessing(false);
      } else {
        // Success - payment method added
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Save Payment Method
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Main component
const PaymentMethodSetup = ({ agentNid, agentName, agentEmail, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const stripePromise = getStripe();

  // Use useQuery instead of useMutation to prevent duplicate calls
  const {
    data: setupData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['agent-payment-setup', agentNid],
    queryFn: () => setupAgentPayment(agentNid, {
      name: agentName,
      email: agentEmail
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent duplicate calls
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const clientSecret = setupData?.data?.client_secret;

  const handleSuccess = () => {
    // Invalidate payment methods query
    queryClient.invalidateQueries({ queryKey: ['agent-payment-methods', agentNid] });
    onSuccess();
  };

  if (isLoading || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Initializing payment setup...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to initialize payment setup. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!stripePromise) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Stripe is not configured. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
        <div className="font-medium text-blue-800">Add Payment Method</div>
        <div className="text-blue-700">
          This payment method will be used for subscription payments.
        </div>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <PaymentForm
          clientSecret={clientSecret}
          onSuccess={handleSuccess}
          onCancel={onCancel}
          agentNid={agentNid}
        />
      </Elements>
    </div>
  );
};

export default PaymentMethodSetup;
