import { format, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'

const LastMailShot = ({ maxDateSent, templateName, total }) => {

  if (!maxDateSent) return null

  return (
    <div className='flex flex-col gap-0 items-start'>
      <div className='space-x-2'>
        <span>
          {templateName}
        </span>
        {total > 1 && (
          <span className='font-bold text-xs'>+{total - 1}</span>
        )}
      </div>
      <div 
        className={cn(
          "inline-flex items-center",
          "h-5 py-0.5",
          "rounded-sm text-left font-normal space-x-1",
          "text-muted-foreground font-thin"
        )} 
      >
        <span>
          {isToday(maxDateSent) 
            ? 'Today'
            : isYesterday(maxDateSent)
            ? 'Yesterday'
            : format(maxDateSent, "d MMM yyy")}
        </span>
        <span>
          {format(maxDateSent, "HH:mm")}
        </span>
      </div>
    </div>
  )
}
  

export default LastMailShot