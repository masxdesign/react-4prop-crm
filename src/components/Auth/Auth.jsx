import { useMemo, useState } from "react"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { authLogin, authLogout, authWhoisonlineQueryOptions } from "@/services/fourProp"
import { AuthContext } from "./Auth-context"

const AuthProvider = ({ children }) => {
    const { data } = useSuspenseQuery(authWhoisonlineQueryOptions)
    const [userRawData, setUser] = useState(data)

    const login = useMutation({ mutationFn: authLogin })
    const logout = useMutation({ mutationFn: authLogout })

    const context = useMemo(() => {

        let user = null

        if (userRawData) {
            user = {
                ...userRawData,
                bz_uid: userRawData.neg_id ? userRawData.neg_id : authUserId
            }
        }

        return {
            isAuthenticated: !!user,
            authUserId: user ? `U${user.id}`: null,
            user,
            setUser,
            login,
            logout
        }

    }, [userRawData, setUser])

    return (
        <AuthContext.Provider value={context}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider