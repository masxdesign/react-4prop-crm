import { memo, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import ChatboxBubble from "./ChatboxBubble"

const Message = memo(({ variant, size, id, message, enableDelete, onDelete }) => {

  const handleDelete = () => {
    onDelete(id)
  }

  return (
    <ChatboxBubble variant={variant} size={size} className='group/speech relative min-w-32'>
      {message}
      {enableDelete && (
        <button onClick={handleDelete} className='shadow-sm absolute border border-red-400 flex items-center justify-center font-mono rounded-full text-red-700 bg-red-100 right-0 -top-2 h-5 w-5 invisible group-hover/speech:visible'>
          &times;
        </button>
      )}
    </ChatboxBubble>
  )
})

const ChatboxMessages = ({ data, onDelete, autoScroll, scrollBehavior, className, enableDelete, ...props }) => {
    const containerRef = useRef(null)
  
    const scrollDown = useCallback(() => {
  
      if(!autoScroll) return
      containerRef.current.scroll({ top: containerRef.current.scrollHeight, behavior: scrollBehavior })
  
    }, [scrollBehavior, autoScroll])
  
    useEffect(() => {
      scrollDown()
    }, [data, scrollDown])
  
    return (
      <div ref={containerRef} className={cn('space-y-3 overflow-y-auto p-3', className)} {...props}>
        {data.map(({ id, message, variant, size }) => (
          <Message 
            key={id} 
            id={id}
            variant={variant} 
            size={size}
            message={message}
            enableDelete={enableDelete}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
}

export default ChatboxMessages