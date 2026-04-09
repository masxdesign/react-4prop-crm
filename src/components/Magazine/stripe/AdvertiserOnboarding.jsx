import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { onboardAdvertiser, getAdvertiserStripeStatus } from '../api';

const AdvertiserOnboarding = ({
  advertiserId,
  advertiserName,
  /** When false, skips status fetch (e.g. until Stripe settings accordion is expanded in edit form). */
  statusQueryEnabled = true,
}) => {
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Query for advertiser Stripe status
  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['advertiser-stripe-status', advertiserId],
    queryFn: () => getAdvertiserStripeStatus(advertiserId),
    refetchInterval: false,
    enabled: !!advertiserId && statusQueryEnabled,
  });

  // Mutation for creating onboarding link
  const onboardMutation = useMutation({
    mutationFn: () => {
      const refreshUrl = window.location.href;
      const returnUrl = `${window.location.origin}/crm/mag/manage-advertisers`;
      return onboardAdvertiser(advertiserId, { refresh_url: refreshUrl, return_url: returnUrl });
    },
    onSuccess: (data) => {
      setIsRedirecting(true);
      // Redirect to Stripe Connect onboarding
      window.location.href = data.data.onboarding_url;
    },
    onError: (error) => {
      console.error('Failed to create onboarding link:', error);
      setIsRedirecting(false);
    }
  });

  const handleStartOnboarding = () => {
    onboardMutation.mutate();
  };

  const handleRefreshStatus = () => {
    refetchStatus();
  };

  if (!statusQueryEnabled) {
    return null;
  }

  if (statusLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking onboarding status...</span>
      </div>
    );
  }

  if (statusError) {
    return (
      <Alert variant="destructive" className="text-sm">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to check onboarding status. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const status = statusData?.data;
  const isOnboarded = status?.onboarding_completed;
  const chargesEnabled = status?.charges_enabled;
  const payoutsEnabled = status?.payouts_enabled;
  const hasRequirements = status?.requirements?.currently_due?.length > 0 ||
                          status?.requirements?.past_due?.length > 0;

  // Fully onboarded and operational
  if (isOnboarded && chargesEnabled && payoutsEnabled && !hasRequirements) {
    return (
      <div className="space-y-3">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Stripe onboarding complete. This advertiser can receive payments.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white border rounded p-2">
            <div className="text-gray-500">Charges</div>
            <div className="font-medium text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Enabled
            </div>
          </div>
          <div className="bg-white border rounded p-2">
            <div className="text-gray-500">Payouts</div>
            <div className="font-medium text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Enabled
            </div>
          </div>
          <div className="bg-white border rounded p-2">
            <div className="text-gray-500">Status</div>
            <div className="font-medium text-green-600">Active</div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshStatus}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>
    );
  }

  // Partially onboarded or has requirements
  if (isOnboarded && hasRequirements) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Additional information required. Please complete the onboarding process.
          </AlertDescription>
        </Alert>

        {status?.requirements?.currently_due?.length > 0 && (
          <div className="text-xs text-gray-600">
            <div className="font-medium mb-1">Currently Due:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {status.requirements.currently_due.map((req, idx) => (
                <li key={idx}>{req.replace(/_/g, ' ')}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleStartOnboarding}
          disabled={onboardMutation.isPending || isRedirecting}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {onboardMutation.isPending || isRedirecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Redirecting...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Complete Onboarding
            </>
          )}
        </Button>
      </div>
    );
  }

  // Not onboarded at all
  return (
    <div className="space-y-3">
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Stripe onboarding required for <strong>{advertiserName}</strong> to receive payments.
        </AlertDescription>
      </Alert>

      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border space-y-2">
        <div className="font-medium">What happens next:</div>
        <ol className="list-decimal list-inside space-y-1">
          <li>You'll be redirected to Stripe</li>
          <li>Complete the onboarding form</li>
          <li>Return here when done</li>
          <li>Start receiving payments</li>
        </ol>
      </div>

      <Button
        onClick={handleStartOnboarding}
        disabled={onboardMutation.isPending || isRedirecting}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {onboardMutation.isPending || isRedirecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Redirecting to Stripe...
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4 mr-2" />
            Start Stripe Onboarding
          </>
        )}
      </Button>

      {onboardMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to create onboarding link. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdvertiserOnboarding;
