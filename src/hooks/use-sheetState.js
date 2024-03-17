import { useSearch } from "@tanstack/react-router"
import { useCallback, useReducer } from "react"
import useRouteSearchStateUpdater from "./use-RouteSearchStateUpdater"

const initialSheetState = { info: null, tab: null, open: false }

const init = ({ 
  tab = initialSheetState.tab, 
  info = initialSheetState.info, 
  open = initialSheetState.open
}) => ({
  ...initialSheetState,
  tab,
  info,
  open
})

const routeSearchUpdateStateAction = (search) => ({
  type: "UPDATE_STATE_SEARCH",
  payload: search
})

const sheetReducer = (state, action) => {
    switch (action.type) {
      case "UPDATE_STATE_SEARCH":
        return init(action.payload)
      case 'OPENED':  
        return {
          ...state,
          open: true
        }
      case 'CLOSED':  
        return {
          ...state,
          open: false,
          tab: null,
          info: null
        }
      case 'TAB_CHANGED':
        return {
          ...state,
          tab: action.payload 
        }
      case 'TRIGGER':
        return {
          ...state,
          tab: action.meta.tab,
          info: action.payload,
          open: true
        }
      case 'RESET':
        return init(action.meta)
      default:
        throw new Error('invalid action')
    }
}

const useSheetState = () => {
    const search = useSearch({ strict: false })

    const [state, dispatch] = useReducer(sheetReducer, search, init)

    const { open, tab, info } = state

    const onOpenChange = useCallback((open) => {
      if(open) {
        dispatch({ type: 'OPENED' })
      } else {
        dispatch({ type: 'CLOSED' })
      }
    }, [])

    const onSelect = useCallback((tab) => {
      dispatch({ type: 'TAB_CHANGED', payload: tab })
    }, [])

    const trigger = useCallback((info, tab) => {
      dispatch({ type: 'TRIGGER', payload: info, meta: { tab: tab ?? search.tab } })
    }, [])

    const reset = useCallback(() => {
      dispatch({ type: 'RESET', payload: null, meta: { defaultTab: search.tab } })
    }, [])

    const sheetProps = {
      open,
      onOpenChange,
    }
    
    const tabProps = {
      tab,
      onSelect
    }

    useRouteSearchStateUpdater({
      initialState: initialSheetState,
      state,
      routeStateMapFn: (p, q) => p(
          q("open"),
          q("tab"),
          q("info")
      ),
      onRouteSearchChange: (search) => dispatch(routeSearchUpdateStateAction(search))
    })

    return [
      info,
      sheetProps,
      trigger,
      reset,
      tabProps
    ]
    
}

export default useSheetState