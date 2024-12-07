import { cx } from "class-variance-authority"
import { Badge } from "@/components/ui/badge"
import { FOURPROP_BASEURL } from "@/services/fourPropClient"

export default function PropertyDetail ({ data, className }) {
    const { 
        id,
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
        <div className={cx('flex gap-4 w-full', className)}>
            <img src={thumbnail} className="object-contain w-20 h-20 bg-gray-200 rounded-sm" />
            <div className="min-w-0 space-y-3 grow">
                <div className="flex flex-col gap-1">
                    <a href={`${FOURPROP_BASEURL}/view-details/${id}`} target="4prop-website" className='hover:underline cursor-pointer font-bold text-sm/snug'>
                        {title}
                    </a>
                    <div className='flex flex-row items-center gap-3 text-sm'>
                        <div className={cx("text-xs font-bold", { 
                            "text-green-600": statusColor === "green",
                            "text-amber-600": statusColor === "amber",
                            "text-sky-600": statusColor === "sky",
                            "text-red-600": statusColor === "red",
                        })}>{statusText}</div>
                        <div className='text-muted-foreground'>{sizeText}</div>
                        <div className='text-muted-foreground'>{tenureText}</div>
                    </div>
                    <div className="w-100 text-sm">
                        <div className="opacity-40">{content.teaser}</div>
                    </div>
                </div>
                {shared && (
                    <Badge variant="info">
                        {shared.tag_name}
                    </Badge>
                )}
            </div>
        </div>   
    )
}