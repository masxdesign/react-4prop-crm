import { useReducer, useState } from "react"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { authLogin, authLogout, authWhoisonlineQueryOptions } from "@/services/fourProp"
import { AuthContext, AuthDispatchContext, useAuthContext, useAuthDispatch } from "./Auth-context"
import { flushSync } from "react-dom"

export const initialAuthState = {
    isAuthenticated: false,
    authUserId: null,
    displayName: null,
    user: null,
    allowFutureFeatured: false
}

const initializer = (user) => {
    if (!user) return initialAuthState
    return {
        ...initialAuthState,
        isAuthenticated: true,
        authUserId: `U${user.id}`,
        displayName: user.display_name ?? `${user.first} ${user.last}`,
        user: {
            ...user,
            bz_uid: user.neg_id ? user.neg_id : `U${user.id}`
        },
        allowFutureFeatured: ['2', '161', '207', '60726'].includes(`${user.id}`),
    }
}

// const userReceived = (user) => ({
//     type: "USER_RECEIVED",
//     payload: user
// })

// function authReducer(state, action) {
//     switch (action.type) {
//         case 'USER_RECEIVED': {
//             const user = action.payload
//             return initializer(user)
//         }
//     }
//     throw Error('Unknown action: ' + action.type);
// }

const AuthProvider = ({ children }) => {
    const { data } = useSuspenseQuery(authWhoisonlineQueryOptions)
    const [state, setState] = useState(() => initializer(data))
    // const [state, dispatch] = useReducer(authReducer, data, initializer)

    return (
        <AuthContext.Provider value={state}>
            <AuthDispatchContext.Provider value={setState}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const state = useAuthContext()
    const setState = useAuthDispatch()

    const login = useMutation({ mutationFn: authLogin })
    const logout = useMutation({ mutationFn: authLogout })

    const handleLoginSubmit = async (variables) => {
        const data = await login.mutateAsync(variables)

        if(data.error) throw new Error(data.error)

        flushSync(() => {
            setState(data)
        })
    }

    const handleLogout = async () => {
        await logout.mutateAsync()
        flushSync(() => {
            setState(null)
        })
    }

    return {
        ...state,
        login,
        loginSubmit: handleLoginSubmit,
        logout: handleLogout
    }
}

export default AuthProvider