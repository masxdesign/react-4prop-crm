import React from "react"
import { cn } from "@/lib/utils"

const ColumnLinkable = React.memo(({ info, names, className, ...props }) => {
    const infoValue = info.getValue()
    const value = names?.[infoValue] ?? infoValue
  
    const handleClick = () => {
      info.table.options.meta.dialogModel.showDialog(info.row.original.id)
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
        {value?.length > 0 ? value : <i className='font-normal opacity-50'>(empty)</i>}
      </div>
    )
})

export default ColumnLinkable