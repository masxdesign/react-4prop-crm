import { useEffect, useReducer, useRef } from "react"

const useExternalIframeTransport = (reducer) => {
    const [state, dispatch] = useReducer(reducer)

    const iframeRef = useRef()

    const postMessage = (action) => {
        iframeRef.current?.contentWindow.postMessage(action, '*')
    }

    useEffect(() => {
        
        function handleResize () {
            postMessage({ type: "frameHeight" })
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }

    }, [])

    useEffect(() => {

        function handleMessage (e) {

            dispatch(e.data)

            if (e.data.type === "frameHeight") {
                iframeRef.current.style.height = e.data.payload + 'px'
            }

        }
        
        window.addEventListener('message', handleMessage)

        return () => {
            window.removeEventListener('message', handleMessage)
        }

    }, [onMessage])

    return { iframeRef, state, dispatch, postMessage }
}

export default useExternalIframeTransport