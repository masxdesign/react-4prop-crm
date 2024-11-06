import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { CheckIcon, MessageSquareWarningIcon } from "lucide-react";

const hoverOverlayWarningTextVariants = cva(
  "flex space-x-3 text-xs",
  {
    variants: {
      variant: {
        warning: "text-yellow-600 warning",
        success: "text-green-600 success",
      }
    },
    defaultVariants: {
      variant: "warning"
    }
  }
)

export default function HoverOverlayWarningText ({ text, variant, className }) {
    return (
      <div className={cn(hoverOverlayWarningTextVariants({ variant }), className)}>
        <Slot className="w-4 h-4">
          {variant === 'success' ? (
            <CheckIcon className='text-green-600' />
          ) : (
            <MessageSquareWarningIcon className='text-yellow-600' />
          )}
        </Slot>
        <span className='text-left'>
          {text}
        </span>
      </div>
    )
}