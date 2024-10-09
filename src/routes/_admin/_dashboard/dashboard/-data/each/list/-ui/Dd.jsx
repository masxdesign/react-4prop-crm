import { cn } from "@/lib/utils"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { forwardRef } from "react"

const Dd = forwardRef(({ 
  bold, 
  label, 
  value, 
  className, 
  disableTruncate, 
  labelClassName = 'min-w-[90px] max-w-[120px]', 
  collapsible, 
  ...props 
}, ref) => (
    <div ref={ref} className={cn('flex flex-row items-start gap-4', className)} {...props}>
      <div className={cn('basis-1/5 text-muted-foreground', labelClassName)}>{label}</div>
      <div className={cn('basis-4/5', { 'truncate': !disableTruncate }, { 'font-bold': bold, 'hover:underline cursor-pointer': collapsible })}>
        {collapsible ? (
          <div className='flex flex-row gap-4 items-center'>
            {value}
            <CaretSortIcon className="h-4 w-4" />
          </div>
        ) : (
          <>
            {value}
          </>
        )}
      </div>
    </div>
))

export default Dd