import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const chatboxBubbleVariants = cva(
    "flex w-max max-w-[75%] min-h-[40px] flex-col gap-2 text-left cursor-pointer",
    {
        variants: {
            variant: {
                recipient: "bg-white",
                sender: "ml-auto bg-sky-100 text-sky-900",
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

const ChatboxBubble = ({ className, variant, size, ...props }) => (
    <div className={cn(chatboxBubbleVariants({ variant, size }), className, 'shadow-sm')} {...props} />
)

export default ChatboxBubble