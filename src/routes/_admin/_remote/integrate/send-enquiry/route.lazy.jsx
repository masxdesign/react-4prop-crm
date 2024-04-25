import useInternalIframeTransport from '@/hooks/use-internalIframeTransport'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useReducer } from 'react'

export const Route = createLazyFileRoute('/_admin/_remote/integrate/send-enquiry')({
  component: Component
})

const initialPageState = {
  globalSelection: []
}

function pageReducer (state, action) {
  switch (action.type) {
    case "globalSelection":
      return {
        globalSelection: action.payload
      }
    default: 
      return state
  }
}

function Component () {

  const [state, dispatch] = useReducer(pageReducer, initialPageState)

  const { postMessage } = useInternalIframeTransport({ dispatch })

  useEffect(() => {

    

  }, [])

  useEffect(() => {

    console.log(state.globalSelection);

  }, [state.globalSelection])

  return (
    <>{`${state.globalSelection}`}</>
  )
}