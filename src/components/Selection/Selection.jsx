import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva, cx } from "class-variance-authority"
import { CheckIcon, Plus } from "lucide-react"

const SelectionVariants = cva("flex gap-3 items-center text-center cursor-pointer", {
    variants: {
        variant: {
            default: "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600 group/default default",
            active: "bg-green-100 text-green-600 group/active active",
            blank: "bg-sky-100 text-sky-600 group/blank blank",
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

export default function Selection ({ variant, size, className, children, ...props }) {
    return (
        <div className={cn(SelectionVariants({ variant, size, className }))} {...props}>
            <div className='text-sm grow min-w-0'>
                <div className="text-left truncate">
                    {children}
                </div>
            </div>
            <Slot className='w-4 h-4 min-w-4'>
                {variant === "blank" ? (
                    <Plus />
                ) : (
                    <CheckIcon 
                        className={'group-[.default]/default:invisible group-hover/default:!visible'} 
                    />
                )}
            </Slot>
        </div>
    )
}