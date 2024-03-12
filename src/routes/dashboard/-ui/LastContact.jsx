import { format, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ResetIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const LastContact = ({ variant, value, onClear, onSelect }) => (
  <div className='flex items-center h-[46px]'>
    <div className='flex flex-col'>
      {value && (
        <small className='opacity-80 text-nowrap'>
          {format(value, "d MMM yyy")}
        </small>
      )}
      <Button variant={variant} size="xs" onClick={onSelect} disabled={isToday(value)}>
        Mark Today
      </Button>
    </div>
    {value && (
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