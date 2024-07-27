import { memo } from "react"
import { cn } from "@/lib/utils"
import { format, isToday } from "date-fns"

const ChatboxSentdate = memo(({ sentdate, className }) => {
    const sentDateMod = sentdate.replace(/(T|Z)/g, ' ')
    return (
        <div className={cn("absolute bottom-1 right-2 text-xs text-nowrap opacity-40 font-thin", className)}>
            {isToday(sentDateMod) ? format(sentDateMod, "HH:mm") : format(sentDateMod, "d MMM yyy HH:mm")}
        </div>
    )
})

export default ChatboxSentdate