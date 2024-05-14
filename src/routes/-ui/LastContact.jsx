import { format, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ResetIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const LastContact = ({ variant = "outline", value, onSelect, clear, onClear }) => (
  <div className='flex items-center'>
    <div className='flex flex-col'>
      {value && isToday(value) ? (
        <div 
          className={cn(
            "inline-flex items-center",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            "text-xs h-7 px-2.5 py-0.5",
            "rounded-sm text-left font-normal"
          )} 
        >
          {format(value, "d MMM yyy")}
        </div>
      ) : (
        <Button variant={variant} size="xs" onClick={onSelect}>
          Mark Today
        </Button>
      )}
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