import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { EnvelopeClosedIcon, EnvelopeOpenIcon, ResetIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SendHorizontalIcon, SendIcon } from 'lucide-react';

const LastContact = ({ variant = "outline", value, unreadTotal, onSelect, clear, onClear }) => (
  <div className='flex items-center'>
    <div className='flex flex-col'>
      {value ? (
        <div 
          className={cn(
            "inline-flex items-center",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            "text-xs h-7 px-2.5 py-0.5",
            "rounded-sm text-left font-normal space-x-1"
          )} 
        >
          {unreadTotal > 0 ? (
            <span className='flex gap-1 text-xs bg-green-500 text-white px-1 rounded'>
              <EnvelopeClosedIcon />
              {unreadTotal}
            </span>
          ) : (
            <span className='flex gap-1 text-xs bg-slate-100 text-white px-1 rounded-full'>
              <SendIcon className='h-4 w-4 text-muted-foreground' />
            </span>
          )}
          <span className='text-muted-foreground font-thin'>
            {isToday(value) 
              ? 'Today'
              : isYesterday(value)
              ? 'Yesterday'
              : format(value, "d MMM yyy")}
          </span>
          <span>
            {format(value, "hh:mm")}
          </span>
        </div>
      ) : onSelect ? (
        <Button variant={variant} size="xs" onClick={onSelect}>
          Mark Today
        </Button>
      ) : null}
    </div>
    {clear && value && (
      <Tooltip>
        <TooltipTrigger asChild>
          <ResetIcon className="ml-4 h-4 w-4 cursor-pointer" onClick={onClear} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Clear date contacted</p>
        </TooltipContent>
      </Tooltip>        
    )}
  </div>
)

export default LastContact