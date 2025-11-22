import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/Auth/Auth';

/**
 * StatsRouter Component
 *
 * Smart router that redirects users to the appropriate statistics page based on their role:
 * - Super Admin (EACH users): Redirect to selection page
 * - Advertisers: Redirect to their own advertiser stats page
 * - Agents: Redirect to their own agency stats page
 */
const StatsRouter = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    
    // Check user role and redirect accordingly
    if (auth.user?.is_admin) {
      // Super admin - redirect to selection page
      navigate({ to: '/stats/select', replace: true });
    } else if (auth.isAdvertiser && auth.user?.advertiser_id) {
      // Advertiser - redirect to their stats page
      navigate({
        to: `/stats/advertiser/${auth.user.advertiser_id}`,
        replace: true,
      });
    } else if (auth.isAgent && auth.user?.cid) {
      // Agent - redirect to their agency stats page
      navigate({
        to: `/stats/agency/${auth.user.cid}`,
        replace: true,
      });
    }
  }, [auth, navigate]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading statistics...</p>
      </div>
    </div>
  );
};

export default StatsRouter;
