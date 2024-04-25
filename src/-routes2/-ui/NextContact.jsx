import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, ResetIcon } from '@radix-ui/react-icons';
import { format, subDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const NextContact = ({ open, value, placeholder = "Pick a date", onClear, onSelect, onOpenChange }) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button
          variant={"outline"}
          size="xs"
          className={cn(
            "w-[140px] pl-2 text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value ? (
            format(value, "d MMM yyy")
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          {value && (
            <Tooltip>
              <TooltipTrigger asChild>
                <ResetIcon className="ml-2 h-4 w-4" onClick={onClear} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear next contact date</p>
              </TooltipContent>
            </Tooltip>        
          )}
        </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={value}
        onSelect={onSelect}
        disabled={(date) => date < subDays(new Date(), 1)}
        initialFocus
      />
    </PopoverContent>
  </Popover>
)

export default NextContact