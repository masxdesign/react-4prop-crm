import { memo } from "react"
import { cn } from "@/lib/utils"
import { format, isToday } from "date-fns"
import myDateTimeFormat from "@/utils/myDateTimeFormat"

const ChatboxSentdate = memo(({ sentdate, className }) => {
    return (
        <div className={cn("absolute bottom-1 right-2 text-xs text-nowrap opacity-40 font-thin", className)}>
            {myDateTimeFormat(sentdate)}
        </div>
    )
})

export default ChatboxSentdate