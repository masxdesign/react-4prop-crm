import React from "react"
import { cn } from "@/lib/utils"
import { format, isToday, isYesterday } from "date-fns"
import { isNumber, isString } from "lodash"
import { Badge } from "@/components/ui/badge"

const ColumnLinkable = React.memo(({ info, names, className, dateFormat, ...props }) => {
    const infoValue = info.getValue()
    const value = names?.[infoValue] ?? infoValue
  
    const handleClick = () => {
      info.table.options.meta.dialogModel.showDialog(info.row.original.id)
    }

    if (dateFormat) {
      
      return (
        <div 
          onClick={handleClick} 
          className={cn(
            "inline-flex items-center",
            "text-xs h-7 px-2.5 py-0.5",
            "rounded-sm text-left font-normal space-x-1",
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
  
    return (
      <div 
        onClick={handleClick} 
        className={cn(
          "cursor-pointer whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline",
          className
        )} 
        {...props}
      >
        <IsString value={value} />
        <IsNumber value={value} />
      </div>
    )
})

function IsString ({ value }) {

  if (!isString(value)) return null

  return (
    value?.length > 0 ? value : <i className='font-normal opacity-50'>(empty)</i>
  )
}

function IsNumber ({ value }) {

  if (!isNumber(value)) return null

  return (
    <Badge variant={value > 0 ? 'default': 'secondary'}>{value}</Badge>
  )
}

export default ColumnLinkable