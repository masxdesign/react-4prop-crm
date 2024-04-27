import { useEffect, useMemo, useReducer } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { propertiesDetails, propertiesDetailsGlobalSelectionQuery, propertiesDetailsSearch } from '@/api/fourProp'
import tableQueryOptions from '@/api/tableQueryOptions'
import useInternalIframeTransport from '@/hooks/use-internalIframeTransport'
import lowerKeyObject from '@/utils/lowerKeyObject'
import propertyParse from '@/utils/propertyParse'

export const Route = createLazyFileRoute('/_admin/_remote/integrate/send-enquiry')({
  component: Component
})

const initialPageState = {
  globalSelection: {
    companies: [],
    properties: [],
    missing: [],
  }
}

function pageReducer (state, action) {
  switch (action.type) {
    case "globalSelection":
      return {
        globalSelection: action.payload
      }
    case "missingReceived":
      return {
        globalSelection: {
          ...state.globalSelection,
          companies: [
            ...state.globalSelection.companies,
            ...action.payload.companies.filter((item) => !state.globalSelection.companies.some(({ c }) => item.c === c))
          ],
          properties: [
            ...state.globalSelection.properties,
            ...action.payload.results.filter((item) => !state.globalSelection.properties.some(({ pid }) => item.PID === pid))
          ],
          missing: state.globalSelection.missing.filter(pid => !action.payload.results.some((item) => item.PID === pid)),
        }
      }
    default: 
      return state
  }
}

function Component () {
  const [state, dispatch] = useReducer(pageReducer, initialPageState)
  const { postMessage } = useInternalIframeTransport({ dispatch })

  const properties = useQuery(propertiesDetailsGlobalSelectionQuery(state.globalSelection))

  useEffect(() => {

    console.log(properties.data);

  }, [properties])

  return null
  
  /*

  const properties = useMemo(() => {
    const list = state.globalSelection.properties.map((property) => lowerKeyObject(property))

    return list.map((info) => ({
      ...info,
      addressText: propertyParse.addressText({ showPostcode: true })(info),
      pictures: propertyParse.pictures(info),
    }))

  }, [state.globalSelection.properties])

  useEffect(() => {

    if (missingProperties.data) {
      dispatch({ type: "missingReceived", payload: missingProperties.data })
    }

  }, [missingProperties.data])

  return (
    <div>
      {properties.map(({ pid, addressText, pictures }) => (
        <div key={pid}>
          {pictures.thumbs[0] && (
            <img src={pictures.thumbs[0]} />
          )}
          {addressText}
        </div>
      ))}
    </div>
  )
  */
}