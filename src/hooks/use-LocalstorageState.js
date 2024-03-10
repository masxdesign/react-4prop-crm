import { useCallback, useEffect, useRef, useState } from "react"

const useLocalstorageState = (keyName, initialState) => {
    const isMountedRef = useRef()

    const keyName_ = JSON.stringify(keyName)

    const fetchData = useCallback(() => {
        const data = localStorage.getItem(keyName_)
        if(!data) {
            const initialState_ = typeof initialState === 'function' ? initialState() : initialState
            localStorage.setItem(keyName_, JSON.stringify(initialState_))
            return initialState_
        }
        return JSON.parse(data)
    }, [keyName_])

    const [state, setState] = useState(fetchData)

    const setState_ = useCallback((newState) => {
        let newState_ = typeof newState === 'function' ? newState(state) : newState
        setState(newState_)
        localStorage.setItem(keyName_, JSON.stringify(newState_))
    }, [state, keyName_])

    useEffect(() => {
        if(isMountedRef.current) {
            setState(fetchData())
        }
    }, [keyName_])

    useEffect(() => {
        isMountedRef.current = true
    }, [])

    return [state, setState_]
}

export default useLocalstorageState