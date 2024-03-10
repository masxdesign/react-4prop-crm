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

const AlertEmailClick = ({ info }) => {

    const value = info.getValue()
    const { alertEmailDate } = info.row.original

    if(!value) return null

    return (
        <div className="flex align-middle space-x-1">
            <Date value={alertEmailDate} />
            <AlertIcon isProp={value.includes('P')} />
            <Dot value={value} />
        </div>
    )
}

export default AlertEmailClick