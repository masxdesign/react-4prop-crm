import { memo } from "react"
import { format, intervalToDuration } from "date-fns"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import Date from "./Date"

// intervalToDuration
const Idu = memo(({ start, end, status, className }) => {
    const { years, months, days, hours, minutes, seconds } = intervalToDuration({ start, end })

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn(
                    className,
                    "cursor-pointer border-b px-1",
                    status === 'bounce' ? 'text-amber-600 border-amber-600 bg-amber-50':
                    status === 'delivery' ? 'text-green-600 border-green-600 bg-green-50':
                    "text-slate-600 border-slate-600 bg-slate-50")}
                >
                    {start ? (
                        <div className={"flex space-x-1"}>
                            {[
                                ['y', years],
                                ['mo', months],
                                ['d', days],
                                ['h', hours],
                                ['m', minutes],
                                ['s', seconds > 0 ? seconds : 1],
                            ]
                            .filter(([_, item]) => item && item > 0)
                            .slice(0, 3)
                            .reverse()
                            .map(([suffix, value]) => (
                                <span key={suffix}>{value}{suffix}</span>
                            ))}
                        </div>
                    ) : (
                        <span>?</span>
                    )} 
                </div>
            </TooltipTrigger>
            <TooltipContent>
                {start ? (status === 'delivery' ? 'Delivered and opened':
                    status === 'bounce' ? 'Email bounced. Likely opened by a bot': 'Was sent'):
                    'Delivery date was not captured. Email was opened'}
            </TooltipContent>
        </Tooltip> 
    )
})


const AlertOpened = ({ info }) => {
    const { alertOpened, alertSentDate, alertStatus } = info.row.original

    return alertOpened ? (
        <div className="flex align-middle space-x-2">
            <Date value={alertOpened} />
            <Idu 
                start={alertSentDate} 
                end={alertOpened} 
                status={alertStatus}
            />
        </div>
    ) : (
        <p>-</p>
    )
}

export default AlertOpened