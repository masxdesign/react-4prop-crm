import React from 'react';
import { BadgePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { isPlatformMor } from '../util/platformMorHelpers';

const PlatformMorBadge = ({ schedule, showTooltip = true, className }) => {
  if (!isPlatformMor(schedule)) return null;

  const badgeContent = (
    <Badge variant="secondary" className={`bg-indigo-100 text-indigo-800 border-indigo-200 ${className}`}>
      <BadgePlus className="h-3 w-3 mr-1" />
      Platform MoR
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs max-w-xs">
            <p className="font-semibold mb-1">Platform Merchant of Record</p>
            <p>BizChat collects payment from estate agent, takes commission, and transfers the remainder to advertiser</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PlatformMorBadge;
