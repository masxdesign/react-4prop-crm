import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import SpeechBubbleTail from "@/assets/SpeechBubbleTail.svg?react"

const chatboxBubbleBzStyleVariants = cva(
    "relative flex w-max max-w-[75%] min-h-[40px] flex-col gap-2 text-left cursor-pointer",
    {
        variants: {
            variant: {
                recipient: "bg-white [&>.speech-bubble-tail]:text-white",
                sender: "ml-auto bg-green-100 [&>.speech-bubble-tail]:text-green-100 text-green-800",
            },
            size: {
                default: "rounded-lg p-4 text-sm",
                sm: "rounded-sm py-1 px-2 text-xs"
            }
        },
        defaultVariants: {
            variant: "recipient",
            size: "default"
        }
    }
)

const ChatboxBubbleBzStyle = ({ className, variant, size, children, ...props }) => (
    <div className={cn(chatboxBubbleBzStyleVariants({ variant, size }), className, 'shadow-sm')} {...props}>
        {children}
        <SpeechBubbleTail 
            className={cn(
                "speech-bubble-tail size-8 absolute bottom-0",
                variant === "sender" ? "-scale-x-100 right-[-27px]" : "left-[-27px] "
            )} 
        />
    </div>
)

export default ChatboxBubbleBzStyle