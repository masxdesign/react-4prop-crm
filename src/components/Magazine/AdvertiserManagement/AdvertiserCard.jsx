import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getAdvertiserStripeStatus } from '../api';
import AdvertiserOnboarding from '../stripe/AdvertiserOnboarding';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { subtypesQuery } from '@/store/listing.queries';

// Advertiser Card Component - Updated for week-based system with Stripe integration
const AdvertiserCard = ({ advertiser, onEdit, onDelete, isDeleting }) => {
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

  // Fetch Stripe onboarding status
  const {
    data: stripeStatusData,
    isLoading: stripeStatusLoading,
  } = useQuery({
    queryKey: ['advertiser-stripe-status', advertiser.id],
    queryFn: () => getAdvertiserStripeStatus(advertiser.id),
    refetchInterval: false
  });

  // Fetch subtypes data for label display
  const { data: subtypesData } = useQuery(subtypesQuery);

  // Get subtype labels from IDs
  const subtypeLabels = useMemo(() => {
    if (!advertiser.pstids || !subtypesData) return [];

    const ids = advertiser.pstids
      .replace(/^,|,$/g, '')
      .split(',')
      .filter(id => id.trim());

    return ids
      .map(id => {
        const subtypeData = subtypesData[id];
        return subtypeData ? subtypeData[0] : null; // subtypeData is [label, alias]
      })
      .filter(Boolean);
  }, [advertiser.pstids, subtypesData]);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${advertiser.company}"?`)) {
      onDelete(advertiser);
    }
  };

  const weekRate = advertiser.week_rate;
  const stripeStatus = stripeStatusData?.data;
  const isOnboarded = stripeStatus?.onboarding_completed;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{advertiser.company}</h3>
            <p className="text-sm text-gray-500">ID: {advertiser.id}</p>

            {/* Stripe Onboarding Status */}
            <div className="mt-2">
              {stripeStatusLoading ? (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Checking status...</span>
                </div>
              ) : isOnboarded ? (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Stripe Connected</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowOnboardingDialog(true)}
                  className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 underline"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>Setup Stripe</span>
                </button>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              £{weekRate}/week
            </div>
            {advertiser.day_rate && !advertiser.week_rate && (
              <div className="text-xs text-gray-400">
                (£{advertiser.day_rate}/day)
              </div>
            )}
          </div>
        </div>

      <div className="space-y-2 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Property Subtypes:</span>
          <div className="text-sm">
            {subtypeLabels.length > 0
              ? subtypeLabels.join(', ')
              : 'All types'
            }
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(advertiser)}
          className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>

    {/* Stripe Onboarding Dialog */}
    <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stripe Onboarding</DialogTitle>
          <DialogDescription>
            Connect {advertiser.company} to Stripe to receive payments.
          </DialogDescription>
        </DialogHeader>
        <AdvertiserOnboarding
          advertiserId={advertiser.id}
          advertiserName={advertiser.company}
        />
      </DialogContent>
    </Dialog>
  </>
  );
};

export default AdvertiserCard;