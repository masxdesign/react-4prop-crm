import axios from 'axios'
import { FOURPROP_BASEURL } from './fourPropClient'

// Token storage key
const TOKEN_KEY = 'api_token'

// Refresh state management
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

/** Get stored JWT token */
export const getToken = () => {
    return sessionStorage.getItem(TOKEN_KEY)
}

/** Set JWT token (pass null to clear) */
export const setToken = (token) => {
    if (token) {
        sessionStorage.setItem(TOKEN_KEY, token)
    } else {
        sessionStorage.removeItem(TOKEN_KEY)
    }
}

/** Clear JWT token */
export const clearToken = () => {
    sessionStorage.removeItem(TOKEN_KEY)
}

/** Raw refresh call (no queue) */
const refreshAccessTokenRaw = async () => {
    const response = await axios.post(
        `${FOURPROP_BASEURL}/api/refresh-token`,
        {},
        { withCredentials: true }
    )
    return response.data.token
}

/** Refresh access token with queue (prevents duplicate calls) */
export const refreshAccessToken = async () => {
    // If already refreshing, wait for the current refresh to complete
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
        })
    }

    isRefreshing = true

    try {
        const newToken = await refreshAccessTokenRaw()
        setToken(newToken)
        processQueue(null, newToken)
        return newToken
    } catch (error) {
        processQueue(error, null)
        // Log CORS/network errors for debugging
        if (!error.response) {
            console.warn('Token refresh failed - network/CORS error:', error.message)
        }
        throw error
    } finally {
        isRefreshing = false
    }
}

window.refreshAccessToken = refreshAccessToken

/** Create axios client with JWT auth and auto-refresh */
export const createAuthClient = (baseURL, options = {}) => {
    const { cacheBuster = true } = options

    const client = axios.create({
        baseURL,
        withCredentials: true
    })

    // Add JWT token and optional cache buster to all requests
    client.interceptors.request.use((config) => {
        // Add JWT token
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Add cache buster for GET requests
        if (cacheBuster && config.method === 'get') {
            config.params = { ...config.params, ts: Date.now() }
        }

        return config
    })

    // Handle 401 responses - attempt token refresh or redirect to login
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config

            // Only handle 401 errors for non-refresh requests
            if (error.response?.status === 401 && !originalRequest._retry) {
                // Don't dispatch session expired if already on login page
                const isOnLoginPage = window.location.pathname.includes('/login')

                const currentToken = getToken()

                // If no token exists, user needs to login
                if (!currentToken) {
                    if (!isOnLoginPage) {
                        window.dispatchEvent(new CustomEvent('auth:session-expired'))
                    }
                    return Promise.reject(error)
                }

                originalRequest._retry = true

                try {
                    // refreshAccessToken has built-in queue mechanism
                    const newToken = await refreshAccessToken()
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return client(originalRequest)
                } catch (refreshError) {
                    // Refresh failed - clear token and dispatch session expired event
                    clearToken()
                    if (!isOnLoginPage) {
                        window.dispatchEvent(new CustomEvent('auth:session-expired'))
                    }
                    return Promise.reject(refreshError)
                }
            }

            return Promise.reject(error)
        }
    )

    return client
}

export default createAuthClient
