import { memo } from "react"
import { cn } from "@/lib/utils"
import { format, isToday } from "date-fns"

const ChatboxSentdate = memo(({ sentdate, className }) => (
    <span className={cn("absolute bottom-1 right-2 text-xs text-nowrap opacity-40 font-thin", className)}>
        {isToday(sentdate) ? format(sentdate, "HH:mm") : format(sentdate, "d MMM yyy")}
    </span>
))

export default ChatboxSentdate