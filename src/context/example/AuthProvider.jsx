import AuthContext from "./AuthContext"
import { useAuthStore } from "@/store"

const AuthProvider = ({ children }) => {
    const userId = useAuthStore.use.userId()
    const login = useAuthStore.use.login()
    const logout = useAuthStore.use.logout()
    const isAuthenticated = !!userId
    return (
      <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
        {children}
      </AuthContext.Provider>
    )
}

export default AuthProvider