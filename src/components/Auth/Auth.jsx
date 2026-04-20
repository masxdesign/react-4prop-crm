import { useEffect, useReducer, useState } from "react"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { authLogin, authLogout, authWhoisonlineQueryOptions } from "@/services/fourProp"
import { AuthContext, AuthDispatchContext, useAuthContext, useAuthDispatch } from "./Auth-context"
import { flushSync } from "react-dom"
import { RESTRICTED_NEG_IDS } from "../DashboardSidebar/permissions"
import { clearToken, setImpersonating } from "@/services/createAuthClient"
import useSessionSync from "@/hooks/useSessionSync"

export const initialAuthState = {
    isAuthenticated: false,
    authUserId: null,
    displayName: null,
    user: null,
    allowFutureFeatured: false,
    isImpersonating: false,
    originalUser: null
}

export const authCombiner = (user, impersonationContext = {}) => {
    if (!user) return initialAuthState

    const isAgent = user.neg_id ? true : false
    // Bitwise role check: 4prop_user=2, advertiser=64
    // If role is 66 (2 | 64), user is both 4prop_user and advertiser
    const isAdvertiser = user.role ? (parseInt(user.role) & 64) === 64 : false

    return {
        ...initialAuthState,
        isAuthenticated: true,
        isAgent,
        isAdvertiser,
        bzUserId: user.neg_id ? user.neg_id : `U${user.id}`,
        authUserId: `U${user.id}`,
        displayName: user.display_name ?? `${user.first} ${user.last}`,
        user: {
            ...user,
            is_admin: RESTRICTED_NEG_IDS.includes(user.neg_id)
        },
        allowFutureFeatured: ['2', '161', '207', '60726'].includes(`${user.id}`),
        isImpersonating: impersonationContext.isImpersonating || false,
        originalUser: impersonationContext.originalUser || null
    }
}

export const authUserCompactOneEmail = (auth) => {
    const { first, last, company, hash } = auth.user
    return {
        firstname: first,
        surname: last,
        companyLogo: company.logo,
        companyName: company.name,
        hash
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
//             return authCombiner(user)
//         }
//     }
//     throw Error('Unknown action: ' + action.type);
// }

const AuthProvider = ({ children }) => {
    const [_authWhoisonlineQueryOptions] = useState(() => {
        const search = new URLSearchParams(window.location.search)
        return authWhoisonlineQueryOptions(search.get('i'))
    })
    const { data } = useSuspenseQuery(_authWhoisonlineQueryOptions)
    const [state, setState] = useState(() => authCombiner(data, {
        isImpersonating: data?.impersonating,
        originalUser: data?.originalUser
    }))
    // const [state, dispatch] = useReducer(authReducer, data, initializer)

    useSessionSync()

    // Listen for session expired events from JWT auth interceptor
    useEffect(() => {
        const handleSessionExpired = () => {
            clearToken()
            setImpersonating(false)
            flushSync(() => {
                setState({ logout: true, sessionExpired: true })
            })
        }

        window.addEventListener('auth:session-expired', handleSessionExpired)
        return () => {
            window.removeEventListener('auth:session-expired', handleSessionExpired)
        }
    }, [])

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

        if (data.error) throw new Error(data.error)

        flushSync(() => {
            setState(authCombiner(data, {
                isImpersonating: data.impersonating,
                originalUser: data.originalUser
            }))
        })
    }

    const handleLogout = async () => {
        await logout.mutateAsync()
        flushSync(() => {
            setState({
                logout: true
            })
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