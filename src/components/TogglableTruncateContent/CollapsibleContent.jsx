import { cn } from "@/lib/utils"
import { useToggle } from "@uidotdev/usehooks"

const TogglableTruncateContent = ({ content, className }) => {
    const [show, toggle] = useToggle(false)

    const handleText = show ? 'less': 'more'

    const handle = (
        <span onClick={toggle} className="cursor-pointer text-xs py-1 px-2 bg-sky-50 text-sky-500 rounded-md">
            {handleText}
        </span>
    )

    if (show) {
        return (
            <div>
                <span className={cn("mr-1", className)}>
                    {content}
                </span>
                {handle}
            </div>
        )
    }

    return (
        <div className="flex gap-1 items-center">
            <span className={cn("truncate", className)}>
                {content}
            </span>
            {handle}
        </div>
    )
}

export default TogglableTruncateContent