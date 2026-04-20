import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

const config = {
  high: { label: 'High', dots: 3, color: 'text-green-600' },
  medium: { label: 'Medium', dots: 2, color: 'text-amber-500' },
  low: { label: 'Low', dots: 1, color: 'text-muted-foreground' }
};

export function ConfidenceBadge({ level }) {
  const { label, dots, color } = config[level] || config.low;

  return (
    <div className={cn('flex items-center gap-1.5 text-sm', color)}>
      <span>{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              'h-2 w-2 rounded-full',
              n <= dots ? 'bg-current' : 'bg-current/20'
            )}
          />
        ))}
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          How popular and steady is this topic? <strong>High</strong> means lots of people search for it regularly. <strong>Medium</strong> means decent interest but less predictable. <strong>Low</strong> means fewer searches or unpredictable interest.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
