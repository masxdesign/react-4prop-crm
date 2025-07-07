import React from "react"
import { cn } from "@/lib/utils"
import { format, isToday, isYesterday } from "date-fns"
import { isNumber, isString } from "lodash"
import { Badge } from "@/components/ui/badge"
import { EnvelopeClosedIcon, Share2Icon } from "@radix-ui/react-icons"
import { Share2, StarIcon, X } from "lucide-react"

const ColumnEnquiries = React.memo(({ info, className, dateFormat, ...props }) => {
    const {
      all_enquiries,
      shared_properties,
      pdf,
      view,
      none,
      suitable,
      new_message
    } = info.row.original
  
    const handleClick = () => {
      info.table.options.meta.dialogModel.showDialog(info.row.original.id)
    }

    if (all_enquiries < 1) {
      return null
    }
  
    return (
      <div 
        onClick={handleClick} 
        className={cn(
          "w-full truncate cursor-pointer whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4",
          className
        )} 
        {...props}
      >
        <div className="flex flex-row items-start gap-3">
          <div className="flex flex-col text-xs">
            <div className="text-nowrap">
              <span className="min-w-4 inline-block">
                {new_message} 
              </span>
              <span className="text-slate-500">Unread</span>
            </div>
            <div className="text-nowrap">
              <span className="min-w-4 inline-block">
                {all_enquiries - shared_properties} 
              </span>
              <span className="text-slate-500">Enquiries</span>
            </div>
            <div className="text-nowrap">
              <span className="min-w-4 inline-block">
                {shared_properties} 
              </span>
              <span className="text-slate-500">Shared</span>
            </div>
          </div>
          <div className="flex flex-col text-xs">
            <div>
              {pdf} <span className="text-slate-500">pdf</span>
            </div>
            <div>
              {view} <span className="text-slate-500">view</span>
            </div>
            <div>
              {none} <span className="text-slate-500">n/a</span>
            </div>
          </div>
          <div className="flex flex-col text-xs">
            <div className="space-x-1">
              <StarIcon className="text-yellow-600 inline-block align-middle size-3" /> 
              <span className="align-middle">
                {suitable}
              </span>
            </div>
            <div className="space-x-1">
              <X className="text-red-600 inline-block align-middle size-3" /> 
              <span className="align-middle">
                {all_enquiries - suitable}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
})

export default ColumnEnquiries