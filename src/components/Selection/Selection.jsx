import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva, cx } from "class-variance-authority"
import { CheckIcon, Plus } from "lucide-react"

const SelectionVariants = cva("flex items-center py-4 px-5 rounded-md text-center cursor-pointer", {
    variants: {
        variant: {
            default: "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600 group/default default",
            active: "bg-green-100 text-green-600 group/active active",
            blank: "bg-sky-100 text-sky-600 group/blank blank",
        }
    },
    defaultVariants: {
        variant: "default"
    }
})

export default function Selection ({ variant, className, children, ...props }) {
    return (
        <div className={cn(SelectionVariants({ variant, className }))} {...props}>
            <span className='text-sm mr-auto'>{children}</span>
            <Slot className='w-4 h-4'>
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