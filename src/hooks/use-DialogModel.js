import { useSearch } from "@tanstack/react-router"
import { useCallback, useReducer } from "react"
import useRouteSearchStateUpdater from "./use-RouteSearchStateUpdater"

const initialState = { info: null, open: false }

const init = ({ 
  info = initialState.info, 
  open = initialState.open
}) => ({
  ...initialState,
  info,
  open
})

const action = {
  routeSearchUpdateState: (search) => ({
    type: "UPDATE_STATE_SEARCH",
    payload: search
  }),
  showDialog: (info) => ({
    type: 'SHOW_DIALOG',
    payload: info
  }),
  hideDialog: () => ({ type: 'HIDE_DIALOG' })
}

const dialogReducer = (state, action) => {
    switch (action.type) {
      case "UPDATE_STATE_SEARCH":
        return {
          ...state,
          ...init(action.payload)
        }
      case 'HIDE_DIALOG':  
        return {
          ...state,
          open: false,
          info: null
        }
      case 'SHOW_DIALOG':
        return {
          ...state,
          open: true,
          info: action.payload
        }
      default:
        throw new Error('invalid action')
    }
}

const useDialogModel = () => {
    const search = useSearch({ strict: false })

    const [state, dispatch] = useReducer(dialogReducer, search, init)

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
      initialState: initialState,
      state,
      routeStateMapFn: (p, q) => p(
          q("open"),
          q("tab"),
          q("info")
      ),
      onRouteSearchChange: (search) => dispatch(action.routeSearchUpdateState(search))
    })

    return [
      info,
      sheetProps,
      trigger,
      reset,
      tabProps
    ]
    
}

export default useDialogModel