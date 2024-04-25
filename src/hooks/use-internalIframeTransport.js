import { useEffect, useReducer } from "react"

const useInternalIframeTransport = ({ dispatch }) => {
    const postMessage = (action) => {
        window.parent.postMessage(action, "*")
    }

    useEffect(() => {

        function onMessage (event) {
            dispatch(event.data)
        }
    
        window.addEventListener('message', onMessage)
    
        return () => {
          window.removeEventListener('message', onMessage)
        }
    
      }, [])
    
      useEffect(() => { 

        postMessage({ type: "mount" })

      }, [])

      return { postMessage }
}

export default useInternalIframeTransport