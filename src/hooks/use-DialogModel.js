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
  openChange: (open) => ({ 
    type: 'OPEN_CHANGE', 
    payload: open 
  })
}

const dialogReducer = (state, action) => {
    switch (action.type) {
      case "UPDATE_STATE_SEARCH":
        return {
          ...state,
          ...init(action.payload)
        }
      case 'OPEN_CHANGE':  
        return {
          ...state,
          open: action.payload,
          info: action.payload ? state.info : null
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

    const onOpenChange = useCallback((open) => {
      dispatch(action.openChange(open))
    }, [])

    const showDialog = useCallback((info) => {
      dispatch(action.showDialog(info))
    }, [])

    useRouteSearchStateUpdater({
      initialState: initialState,
      state,
      routeStateMapFn: (p, q) => p(
          q("open"),
          q("info")
      ),
      onRouteSearchChange: (search) => dispatch(action.routeSearchUpdateState(search))
    })

    return {
      state,
      onOpenChange,
      showDialog
    }
    
}

export default useDialogModel