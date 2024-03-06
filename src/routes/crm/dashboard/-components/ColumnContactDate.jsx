import { Button } from '@/components/ui/button';
import { ResetIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import usePrivateNotesMutation from '../-hooks/use-privateNotesMutation';
import { isToday } from 'date-fns';

const ColumnContactDate = ({ info, onSuccess }) => {
  
    const curr_field = 'contact_date'
  
    const value = info.row.getValue(curr_field)
  
    const mutation = usePrivateNotesMutation(info, curr_field, onSuccess)
    
    const handleSelect = () => {
      mutation.mutate({ [curr_field]: new Date })
    }
   
    const handleClear = () => {
      mutation.mutate({ [curr_field]: null })
    }
  
    if(mutation.isPending) return <small className='text-muted-foreground flex items-center h-[46px]'>Saving...</small>
  
    return (
      <div className='flex items-center h-[46px]'>
        <div className='flex flex-col'>
          {value && (
            <small className='opacity-80 text-nowrap'>
              {format(value, "d MMM yyy")}
            </small>
          )}
          <Button variant="default" size="xs" onClick={handleSelect} disabled={isToday(value)}>
            Mark Today
          </Button>
        </div>
        {value && (
          <Tooltip>
            <TooltipTrigger asChild>
              <ResetIcon className="ml-4 h-4 w-4 cursor-pointer" onClick={handleClear} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear date contacted</p>
            </TooltipContent>
          </Tooltip>        
        )}
      </div>
    )
}

export default ColumnContactDate