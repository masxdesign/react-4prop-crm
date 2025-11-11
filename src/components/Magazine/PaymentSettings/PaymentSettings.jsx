import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Loader2, Plus, Check, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAgentPaymentMethods, setDefaultPaymentMethod } from '../api';
import PaymentMethodSetup from '../stripe/PaymentMethodSetup';
import { useAuth } from '@/components/Auth/Auth-context';
import { cn } from '@/lib/utils';

const PaymentSettings = () => {
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showSetDefaultPrompt, setShowSetDefaultPrompt] = useState(false);
  const [newlyAddedCardId, setNewlyAddedCardId] = useState(null);
  const queryClient = useQueryClient();
  const auth = useAuth();
  const agentNid = auth?.user?.neg_id;
  const agentName = `${auth?.user?.first || ''} ${auth?.user?.last || ''}`.trim();
  const agentEmail = auth?.user?.email || '';

  // Fetch payment methods
  const {
    data: paymentMethodsData,
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError
  } = useQuery({
    queryKey: ['agent-payment-methods', agentNid],
    queryFn: () => getAgentPaymentMethods(agentNid),
    enabled: !!agentNid
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: (paymentMethodId) => setDefaultPaymentMethod(agentNid, { payment_method_id: paymentMethodId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-payment-methods', agentNid] });
    },
    onError: (error) => {
      console.error('Failed to set default payment method:', error);
    }
  });

  const handleAddPaymentSuccess = async () => {
    setShowAddPaymentMethod(false);

    // Refresh payment methods to get the newly added card
    await queryClient.invalidateQueries({ queryKey: ['agent-payment-methods', agentNid] });

    // Wait a bit for the query to refetch
    setTimeout(() => {
      const updatedMethods = queryClient.getQueryData(['agent-payment-methods', agentNid]);
      const methods = updatedMethods?.data || [];

      // Find the most recently added card (newest one)
      if (methods.length > 0) {
        // Sort by created timestamp if available, otherwise just take the first non-default
        const newestCard = methods.find(m => !m.is_default) || methods[methods.length - 1];

        if (newestCard && !newestCard.is_default) {
          setNewlyAddedCardId(newestCard.id);
          setShowSetDefaultPrompt(true);
        }
      }
    }, 500);
  };

  const handleSetDefault = (paymentMethodId) => {
    setDefaultMutation.mutate(paymentMethodId);
  };

  const paymentMethods = paymentMethodsData?.data || [];

  if (!agentNid) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load user information. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center py-4 mr-3">
        <div>
          <h2 className="text-xl font-bold">Payment Settings</h2>
          <p className="text-gray-600">Manage your payment methods for booking subscriptions</p>
        </div>
        <Button
          onClick={() => setShowAddPaymentMethod(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Payment Methods List */}
      {paymentMethodsLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : paymentMethodsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load payment methods. Please try again.
          </AlertDescription>
        </Alert>
      ) : paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No payment methods yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add a payment method to activate booking subscriptions
          </p>
          <Button
            onClick={() => setShowAddPaymentMethod(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Payment Method
          </Button>
        </div>
      ) : (
        <div className="flex flex-row gap-8">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onSetDefault={handleSetDefault}
              isSettingDefault={setDefaultMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddPaymentMethod} onOpenChange={setShowAddPaymentMethod}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new card or payment method for subscription payments.
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodSetup
            agentNid={agentNid}
            agentName={agentName}
            agentEmail={agentEmail}
            onSuccess={handleAddPaymentSuccess}
            onCancel={() => setShowAddPaymentMethod(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Set Default Card Prompt Dialog */}
      <Dialog open={showSetDefaultPrompt} onOpenChange={setShowSetDefaultPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set as Default Payment Method?</DialogTitle>
            <DialogDescription>
              Would you like to set this newly added card as your default payment method?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {newlyAddedCardId && (() => {
              const newCard = paymentMethods.find(m => m.id === newlyAddedCardId);
              if (!newCard) return null;

              const cardBrand = newCard.card?.brand || 'card';
              const last4 = newCard.card?.last4 || '****';

              return (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <CreditCard className="h-8 w-8 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{cardBrand}</div>
                    <div className="text-sm text-gray-600">•••• •••• •••• {last4}</div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowSetDefaultPrompt(false);
                setNewlyAddedCardId(null);
              }}
            >
              No, keep current
            </Button>
            <Button
              onClick={() => {
                handleSetDefault(newlyAddedCardId);
                setShowSetDefaultPrompt(false);
                setNewlyAddedCardId(null);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Yes, set as default
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ method, onSetDefault, isSettingDefault }) => {
  const isDefault = method.is_default || false;
  const cardBrand = method.card?.brand || 'card';
  const last4 = method.card?.last4 || '****';
  const expMonth = method.card?.exp_month || '**';
  const expYear = method.card?.exp_year ? String(method.card.exp_year).slice(-2) : '**';

  // Brand colors - different gradient for default card
  const brandColors = {
    visa: 'from-blue-600 to-blue-700',
    mastercard: 'from-orange-600 to-orange-700',
    amex: 'from-green-600 to-green-700',
    discover: 'from-purple-600 to-purple-700',
    default: 'from-gray-600 to-gray-700'
  };

  const gradientClass = brandColors[cardBrand.toLowerCase()] || brandColors.default;

  return (
    <div className={cn(
      gradientClass,
      'max-w-96 min-h-52', 
      'relative bg-gradient-to-br rounded-lg p-6 text-white',
      isDefault
        ? `shadow-xl ring-2 ring-blue-400 ring-offset-2`
        : `shadow-lg`
    )}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className='mt-4'>
            <div className="text-sm opacity-80 uppercase">{cardBrand}</div>
            <div className="text-2xl font-mono tracking-wider mt-1">
              •••• •••• •••• {last4}
            </div>
          </div>
          <CreditCard className="h-8 w-8 mix-blend-overlay text-white" strokeWidth={2} />
        </div>

        <div className="text-sm">
          <div className="opacity-70 text-xs">Expires</div>
          <div className="font-mono">{expMonth}/{expYear}</div>
        </div>

        <div className='absolute bottom-4 right-4 flex items-center min-h-7'>
          {isDefault ? (
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Check className="h-3 w-3" />
              Default
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(method.id)}
              disabled={isSettingDefault}
              className="bg-white/10 hover:bg-white/20 border-white/30 !text-white text-xs"
            >
              {isSettingDefault ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Set Default'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
