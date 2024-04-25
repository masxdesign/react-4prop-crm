import { useCallback, useEffect, useRef } from "react"
import ChatboxBubble from "./ChatboxBubble"
import { cn } from "@/lib/utils"

const ChatboxMessages = ({ data, onDelete, autoScroll, scrollBehavior, className, enableDelete }) => {
    const containerRef = useRef(null)
  
    const scrollDown = useCallback(() => {
  
      if(!autoScroll) return
      containerRef.current.scroll({ top: containerRef.current.scrollHeight, behavior: scrollBehavior })
  
    }, [scrollBehavior, autoScroll])
  
    useEffect(() => {
      scrollDown()
    }, [data, scrollDown])
  
    return (
      <div ref={containerRef} className={cn('space-y-3 overflow-y-auto p-3', className)}>
        {data.map(({ id, message, variant, size }) => (
          <ChatboxBubble key={id} variant={variant} size={size} className='group/speech relative min-w-32'>
            {message}
            {enableDelete && (
              <button onClick={() => onDelete(id)} className='shadow-sm absolute border border-red-400 flex items-center justify-center font-mono rounded-full text-red-700 bg-red-100 right-0 -top-2 h-5 w-5 invisible group-hover/speech:visible'>
                &times;
              </button>
            )}
          </ChatboxBubble>
        ))}
      </div>
    )
}

export default ChatboxMessages