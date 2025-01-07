import { createContext, useContext } from "react"

export const AuthContext = createContext(null)
export const AuthDispatchContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const useAuthDispatch = () => {
    const context = useContext(AuthDispatchContext)
    if (!context) {
        throw new Error('useAuthDispatch must be used within an AuthProvider')
    }
    return context
}