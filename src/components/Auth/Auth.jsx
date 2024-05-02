import { useMemo, useState } from "react"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { AuthContext } from "./Auth-context"
import { authLogin, authLogout, authWhoisonlineQueryOptions } from "@/api/fourProp"

const AuthProvider = ({ children }) => {
    const { data } = useSuspenseQuery(authWhoisonlineQueryOptions)
    const [user_, setUser] = useState(data)

    const user = useMemo(() => ({
        ...user_,
        bz_uid: user_.neg_id ? user_.neg_id : `U${user_.id}`
    }), [user_])

    const isAuthenticated = !!user

    const login = useMutation({ mutationFn: authLogin })
    const logout = useMutation({ mutationFn: authLogout })

    return (
        <AuthContext.Provider 
            value={{ 
                isAuthenticated, 
                user, 
                login, 
                setUser, 
                logout 
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider