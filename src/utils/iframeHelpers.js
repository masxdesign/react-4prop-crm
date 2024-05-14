import { useCallback, useEffect, useRef } from "react"
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
    if ([window.location.origin].includes(event.origin)) return
    switch (event.data.type) {
      default:
        useListing.getState().dispatch(event.data)
    }
}

export function useIframeHelper () {
    const ref = useRef()
    const prevRef = useRef()

    const frameHeightUpdate = useCallback(() => {
      const height = getFrameHeight(ref.current)
      if (prevRef.current === height) return
      postMessage({ type: "FRAME_HEIGHT", payload: height })
      prevRef.current = height
    }, [])

    useEffect(() => {
        const intvId = setInterval(frameHeightUpdate, 150)
        return () => {
          clearInterval(intvId)
        }
      }, [])

      return ref
}