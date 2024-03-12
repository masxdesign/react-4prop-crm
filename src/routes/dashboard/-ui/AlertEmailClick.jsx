import React from "react"
import { cn } from "@/lib/utils"
import AlertIcon from "./AlertIcon"
import { format } from "date-fns"
import Date from "./Date"

const Dot = React.memo(({ value }) => {
    const [css, label] = {
        '0': ["justify-start", "top"],
        '1': ["justify-center", "mid"],
        '2': ["justify-end", "end"]
    }[value.substring(value.length - 1)]

    return (
        <div className={cn("h-[20px] w-[40px] flex flex-col text-green-600", css)}>
            <div className="text-xs basis-1/3 h-[10px] flex items-center space-x-1">
                <div className="block rounded-full h-2 w-2 bg-green-600" />
                <span>{label}</span>
            </div>
        </div>
    )
})

const AlertEmailClick = ({ info, showDate }) => {
    const { alertEmailDate, alertEmailClick } = info.row.original

    if(!alertEmailClick) return null

    return (
        <div className="flex flex-row items-center gap-1 text-xs">
            {showDate && <Date value={alertEmailDate} />}
            <AlertIcon isProp={alertEmailClick.includes('P')} />
            <Dot value={alertEmailClick} />
        </div>
    )
}

export default AlertEmailClick