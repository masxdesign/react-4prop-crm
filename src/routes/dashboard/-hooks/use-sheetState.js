import { useCallback, useReducer } from "react"

const initialSheetState = { info: null, tab: 'view', open: false }

const sheetReducer = (state, action) => {
    switch (action.type) {
      case 'open':  
        return {
          ...state,
          open: action.payload
        }
      case 'tab':
        return {
          ...state,
          tab: action.payload 
        }
      case 'info': 
        return {
          ...state,
          info: action.payload 
        }
      case 'show':
        return {
          ...state,
          tab: action.payload.tab ?? initialSheetState.tab,
          info: action.payload.info,
          open: true
        }
      case 'hideDialog':
        return initialSheetState
      default:
        throw new Error('invalid action')
    }
}

const useSheetState = ({ props = null }) => {
    const [state, dispatch] = useReducer(sheetReducer, initialSheetState)

    const onOpenChange = useCallback((open) => {
        dispatch({ type: 'open', payload: open })
    }, [])

    const onTabValueChange = useCallback((tab) => {
        dispatch({ type: 'tab', payload: tab })
    }, [])

    const showSheet = useCallback((info, tab) => {
        dispatch({ type: 'show', payload: { info, tab } })
    }, [])

    return {
        sheetProps: {
            ...props,
            ...state,
            onOpenChange,
            onTabValueChange,
        },
        showSheet
    }
}

export default useSheetState