import { useCallback, useEffect, useRef } from "react"
import SpeechBubble from "./SpeechBubble"

const LogChatbox = ({ data, onDelete, autoScroll, scrollBehavior }) => {
    const containerRef = useRef(null)
  
    const scrollDown = useCallback(() => {
  
      if(!autoScroll) return
      containerRef.current.scroll({ top: containerRef.current.scrollHeight, behavior: scrollBehavior })
  
    }, [scrollBehavior, autoScroll])
  
    useEffect(() => {
      scrollDown()
    }, [data, scrollDown])
  
    return (
      <div ref={containerRef} className='h-[300px] space-y-4 overflow-y-auto'>
        {data.map(({ id, message, variant }) => (
          <SpeechBubble key={id} variant={variant} className='group/speech relative'>
            {message}
            <button onClick={() => onDelete(id)} className='shadow-sm absolute border border-red-400 flex items-center justify-center font-mono rounded-full text-red-700 bg-red-100 right-0 -top-2 h-5 w-5 invisible group-hover/speech:visible'>
              &times;
            </button>
          </SpeechBubble>
        ))}
      </div>
    )
}

export default LogChatbox