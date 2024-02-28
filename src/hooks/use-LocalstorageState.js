import { useCallback, useMemo, useState } from "react"

const useLocalstorageState = (keyName, initialState) => {
    const keyName_ = useMemo(() => JSON.stringify(keyName), [keyName])

    const [state, setState] = useState(() => {
        const data = localStorage.getItem(keyName_)
        if(!data) {
            const initialState_ = typeof initialState === 'function' ? initialState() : initialState
            localStorage.setItem(keyName_, JSON.stringify(initialState_))
            return initialState_
        }
        return JSON.parse(data)
    })

    const setState_ = useCallback((newState) => {
        let newState_ = typeof newState === 'function' ? newState(state) : newState
        setState(newState_)
        localStorage.setItem(keyName_, JSON.stringify(newState_))
    }, [state, keyName_])

    return [state, setState_]
}

export default useLocalstorageState