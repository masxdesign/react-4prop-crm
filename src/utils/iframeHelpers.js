import { useEffect, useRef } from "react"
import useListing from "@/store/use-listing"

const getWinHeight = () => {
    const { body, documentElement: html } = document
    return Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight)
}

export const getFrameHeight = (element) => {
    const height = element 
        ? element.offsetHeight
        : getWinHeight()

    return height  
}

export function postMessage (action) {
    window.parent.postMessage(action, "*")
}

export function onMessage (event) {
    switch (event.data.type) {
      default:
        useListing.getState().dispatch(event.data)
    }
}

export function useIframeHelper () {
    const ref = useRef()

    useEffect(() => {
        postMessage({ type: "FRAME_HEIGHT", payload: getFrameHeight(ref.current) })
    })

    useEffect(() => {
    
        function onMessage (e) {
          switch (e.data.type) {
            case "INVOKE_FRAME_HEIGHT":
              postMessage({ type: "FRAME_HEIGHT", payload: getFrameHeight(ref.current) })
              break 
          }
        }
    
        window.addEventListener("message", onMessage)
        
        return () => {
          window.removeEventListener("message", onMessage)
        }
    
      }, [])

      return ref
}