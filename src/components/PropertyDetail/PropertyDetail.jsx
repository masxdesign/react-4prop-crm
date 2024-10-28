import { cx } from "class-variance-authority"
import { Badge } from "@/components/ui/badge"

export default function PropertyDetail ({ data, className }) {
    const { 
        title, 
        statusColor, 
        statusText, 
        sizeText, 
        tenureText, 
        thumbnail, 
        content, 
        shared = null 
    } = data
    return (
        <div className={cx("space-y-3", className)}>
            <div className='flex gap-3'>
                <img src={thumbnail} className="object-contain w-20 h-20 bg-gray-200" />
                <div className="space-y-1 sm:space-y-1 text-sm grow">
                    <span className='font-bold'>
                        {title}
                    </span>
                    <div className='flex flex-row gap-3'>
                        <div className={cx("text-xs font-bold", { 
                            "text-green-600": statusColor === "green",
                            "text-amber-600": statusColor === "amber",
                            "text-sky-600": statusColor === "sky",
                            "text-red-600": statusColor === "red",
                        })}>{statusText}</div>
                        <div className='text-xs text-muted-foreground'>{sizeText}</div>
                        <div className='text-xs text-muted-foreground'>{tenureText}</div>
                    </div>
                    <div className="text-xs opacity-40 truncate max-w-52">{content.teaser}</div>
                    {shared && (
                        <Badge>
                            {shared.tag_name}
                        </Badge>
                    )}
                </div>
            </div>                
        </div>
    )
}