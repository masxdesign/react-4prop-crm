import { useReducer } from "react"

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

const useSheetState = () => {
    const [state, dispatch] = useReducer(sheetReducer, initialSheetState)

    const onOpenChange = (open) => {
        dispatch({ type: 'open', payload: open })
    }

    const onTabValueChange = (tab) => {
        dispatch({ type: 'tab', payload: tab })
    }

    const showSheet = (info, tab) => {
        dispatch({ type: 'show', payload: { info, tab } })
    }

    return {
        sheetProps: {
            ...state,
            onOpenChange,
            onTabValueChange,
        },
        showSheet
    }
}

export default useSheetState