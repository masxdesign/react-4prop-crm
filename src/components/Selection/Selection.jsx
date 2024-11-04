import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva, cx } from "class-variance-authority"
import { CheckIcon, Plus } from "lucide-react"

const SelectionVariants = cva("flex gap-3 items-center text-center cursor-pointer relative", {
    variants: {
        variant: {
            default: "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600 group/default default",
            active: "bg-green-100 text-green-600 group/active active",
            plus: "bg-sky-100 text-sky-600",
            'outline-default': "border border-slate-600 text-slate-600",
            'outline-active': "border border-green-600 text-green-600 group/active active",
            'outline-plus': "border border-sky-600 text-sky-600"
        },
        size: {
            sm: "py-2 px-3 rounded-sm",
            md: "py-4 px-5 rounded-md"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "md"
    }
})

export default function Selection ({ variant, size, className, children, disabled, onClick: onClickProp, hoverOverlayText, ...props }) {
    return (
        <div 
            className={cn(SelectionVariants({ 
                variant, 
                size, 
                className: cx(className, 
                    { 'bg-opacity-40': disabled },
                    { 'group/hoverOverlayText': hoverOverlayText }
                ) 
            }))} 
            onClick={() => {
                if (disabled) return
                onClickProp?.()
            }}
            {...props}
        >
            <div className={cx('text-sm grow min-w-0', { 'opacity-50': disabled })}>
                <div className="text-left truncate">
                    {children}
                </div>
            </div>
            <Slot className='w-4 h-4 min-w-4'>
                {["plus", "outline-plus"].includes(variant) ? (
                    <Plus />
                ) : (
                    <CheckIcon 
                        className={'group-[.default]/default:invisible group-hover/default:!visible'} 
                    />
                )}
            </Slot>
            {!!hoverOverlayText && (
                <span className="absolute inset-0 bg-yellow-100/80 hidden group-hover/hoverOverlayText:flex">
                    <div className="my-auto mx-4">
                        {hoverOverlayText}
                    </div>
                </span>
            )}
        </div>
    )
}