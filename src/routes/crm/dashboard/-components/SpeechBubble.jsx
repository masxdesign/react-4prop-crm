import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const speechBubbleVariants = cva(
    "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm text-left cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-muted",
                author: "ml-auto bg-sky-100 text-sky-900",
            },
        },
        defaultVariants: {
            variant: "default",
        }
    }
)

const SpeechBubble = ({ className, variant, ...props }) => (
    <div className={cn(speechBubbleVariants({ variant }), className)} {...props} />
)

export default SpeechBubble