import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { format, isValid } from "date-fns"

const Date = ({ value }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="opacity-50 cursor-pointer hover:underline">{format(value, "dMMMyy")}</span>
            </TooltipTrigger>
            <TooltipContent>
                {format(value, "hh:mm")}
            </TooltipContent>
        </Tooltip> 
    )
}

export default Date