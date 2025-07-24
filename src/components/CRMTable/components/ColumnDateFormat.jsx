import { cn } from "@/lib/utils"
import { format, isToday, isYesterday } from "date-fns"

const ColumnDateFormat = ({ value, className, ...props }) => {

    return (
         <div 
            className={cn(
                "cursor-pointer whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline p-4 flex gap-1",
                className
            )} 
            {...props}
        >
            <span className='text-muted-foreground font-thin'>
                {isToday(value) 
                    ? 'Today'
                    : isYesterday(value)
                    ? 'Yesterday'
                    : format(value, "d MMM yyy")}
            </span>
            <span>
                {format(value, "HH:mm")}
            </span>
        </div>
    )
}

export default ColumnDateFormat