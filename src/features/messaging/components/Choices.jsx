import { cn } from "@/lib/utils"
import { FileCheckIcon, HomeIcon } from "lucide-react"

function Choices({ className, choices }) {

    if (choices === null || choices < 1) return null
  
    return (
      <ul className={cn('flex gap-4 text-xs', className)}>
        {(choices & 2) > 0 && (
          <li className='flex items-center gap-1'>
            <FileCheckIcon strokeWidth={2} className='size-3' />
            PDF sent
          </li>
        )}
        {(choices & 1) > 0 && (
          <li className='flex items-center gap-1'>
            <HomeIcon strokeWidth={2} className='size-3' />
            View requested
          </li>
        )}
      </ul>
    )
}

export default Choices