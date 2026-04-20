import React from 'react';
import { Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import usePropertySubtypes from '@/hooks/usePropertySubtypes';

// Advertiser Card Component - Updated for week-based system (Stripe Connect lives in Edit form)
const AdvertiserCard = ({ advertiser, onEdit, onDelete, isDeleting }) => {
  // Get subtype labels using the custom hook
  const { getSubtypeLabels } = usePropertySubtypes();
  const subtypeLabels = getSubtypeLabels(advertiser.pstids);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${advertiser.company}"?`)) {
      onDelete(advertiser);
    }
  };

  const handleCopyEmail = () => {
    if (advertiser.email) {
      navigator.clipboard.writeText(advertiser.email);
      toast({
        title: 'Email copied',
        description: 'Email address copied to clipboard',
        duration: 2000,
      });
    }
  };

  const weekRate = advertiser.week_rate;

  const siteModeLabels = {
    advertiser_site: 'Advertiser site',
    '4prop_site': '4prop site',
    agentab: 'AgentAB',
  };
  const siteModeLabel = siteModeLabels[advertiser.site_mode] || 'Advertiser site';

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="shrink-0 flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold mr-4">{advertiser.company}</h3>

          {advertiser.email && (
            <div className="mt-1">
              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 group"
                title="Click to copy email"
              >
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[180px]">{advertiser.email}</span>
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-green-600">
            £{weekRate}<span className='text-sm font-light'>/week</span>
          </div>
          {advertiser.day_rate && !advertiser.week_rate && (
            <div className="text-xs text-gray-400">
              (£{advertiser.day_rate}/day)
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 space-y-2 mb-auto">
        <div>
          <span className="text-xs font-medium text-gray-500">Mode</span>
          <div className="text-xs text-gray-800">{siteModeLabel}</div>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">Property Subtypes</span>
          <div className="text-xs">
            {subtypeLabels.length > 0
              ? subtypeLabels.join(', ')
              : 'All types'
            }
          </div>
        </div>
      </div>

      <div className="shrink-0 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(advertiser)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  );
};

export default AdvertiserCard;
