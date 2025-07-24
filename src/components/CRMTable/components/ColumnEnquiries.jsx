import React from "react"
import { cn } from "@/lib/utils"
import { Share2, StarIcon, X } from "lucide-react"

const ColumnEnquiries = React.memo(({ info, onClick, className, ...props }) => {
    const {
      all_enquiries,
      shared_properties,
      pdf,
      view,
      none,
      suitable,
      new_message
    } = info.row.original

    if (all_enquiries < 1) {
      return (
        <div 
          onClick={onClick}
          className="p-4 italic font-normal opacity-50 w-full hover:underline"
        >
          No data yet
        </div>
      )
    }
  
    return (
      <div 
        className={cn(
          "px-4 py-2 w-full truncate cursor-pointer whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4",
          className
        )} 
        onClick={onClick}
        {...props}
      >
        <div className="flex flex-row items-start gap-3">
          <div className="flex flex-col text-xs">
            <div className="text-nowrap">
              <span className="min-w-4 inline-block">
                {new_message} 
              </span>
              <span className="text-slate-500">Unanswered</span>
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