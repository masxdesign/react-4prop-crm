import { useCallback, useReducer } from "react"

const initialSheetState = { info: null, tab: null, open: false }

const init = (defaultTab) => ({
  ...initialSheetState,
  tab: defaultTab
})

const sheetReducer = (state, action) => {
    switch (action.type) {
      case 'OPEN':  
        return {
          ...state,
          open: action.payload
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

const useSheetState = ({ defaultTab = null } = {}) => {

    const [{ open, tab, info }, dispatch] = useReducer(sheetReducer, defaultTab, init)

    const onOpenChange = useCallback((open) => {
      dispatch({ type: 'OPEN', payload: open })
    }, [])

    const onSelect = useCallback((tab) => {
      dispatch({ type: 'TAB_CHANGED', payload: tab })
    }, [])

    const trigger = useCallback((info, tab = defaultTab) => {
      dispatch({ type: 'TRIGGER', payload: info, meta: { tab } })
    }, [])

    const reset = useCallback(() => {
      dispatch({ type: 'RESET', payload: null, meta: { defaultTab } })
    }, [])

    const sheetProps = {
      open,
      onOpenChange,
    }
    
    const tabProps = {
      tab,
      onSelect
    }

    return [
      info,
      sheetProps,
      trigger,
      reset,
      tabProps
    ]
    
}

export default useSheetState