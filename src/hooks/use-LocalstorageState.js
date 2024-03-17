import { useIsFirstRender } from "@uidotdev/usehooks"
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"

const _getState = (data, prevData) => typeof data === 'function' ? data(prevData) : data

const forceHydrate = (key, data) => {
    const data_ = _getState(data)
    localStorage.setItem(key, JSON.stringify(data_))
    return data_
}

const hydrateData = (key, data) => {
    const data_ = localStorage.getItem(key)
    if(!data_) return forceHydrate(key, data)
    return JSON.parse(data_)
}

const initialState = []

const reducer = (state, { type, payload, meta }) => {
    switch (type) {
        case "CHANGE":
            return state.map(({ key, data }) => ({
                key,
                data: key === meta.key 
                    ? _getState(payload, data)
                    : data
            }))
        case "ADD":
            return [
                { key: meta.key, data: _getState(payload) }
            ]
    }
}

const init = ([key, data]) => ([
    ...initialState,
    { key, data: hydrateData(key, data) }
])

const addData = (key, payload) => ({
    type: 'ADD',
    meta: { key },
    payload
})

const changeData = (key, payload) => ({
    type: 'CHANGE',
    meta: { key },
    payload
})

const useLocalstorageState = (keyName, initialData) => {
    const isFirstRender = useIsFirstRender()

    const keyName_ = JSON.stringify(keyName)

    const [state, dispatch] = useReducer(reducer, [keyName_, initialData], init)

    const state_ = useMemo(() => {
        
        const item = state.find(({ key }) => key === keyName_)

        if(item) return item.data

        return _getState(initialData)
    
    }, [keyName_, state, initialData])

    const setState_ = useCallback((newState) => {
        const newState_ = _getState(newState, state_)
        dispatch(changeData(keyName_, newState_))
        forceHydrate(keyName_, newState_)
    }, [keyName_, state_, dispatch])

    useEffect(() => {
        if(!isFirstRender) {
            dispatch(addData(keyName_, hydrateData(keyName_, initialData)))
        }
    }, [keyName_])
    
    return [state_, setState_]
}

export default useLocalstorageState