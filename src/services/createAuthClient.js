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

/**
 * Get the stored JWT token
 * @returns {string|null}
 */
export const getToken = () => {
    return sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Set the JWT token
 * @param {string} token
 */
export const setToken = (token) => {
    if (token) {
        sessionStorage.setItem(TOKEN_KEY, token)
    } else {
        sessionStorage.removeItem(TOKEN_KEY)
    }
}

/**
 * Clear the JWT token (logout)
 */
export const clearToken = () => {
    sessionStorage.removeItem(TOKEN_KEY)
}

/**
 * Refresh the access token using the httpOnly refresh token cookie
 * @returns {Promise<string>} New access token
 */
export const refreshAccessToken = async () => {
    try {
        const response = await axios.post(
            `${FOURPROP_BASEURL}/api/refresh-token`,
            {},
            { withCredentials: true }
        )
        return response.data.token
    } catch (error) {
        // Log CORS/network errors for debugging
        if (!error.response) {
            console.warn('Token refresh failed - network/CORS error:', error.message)
        }
        throw error
    }
}

window.refreshAccessToken = refreshAccessToken

/**
 * Create an axios client with JWT authentication and auto-refresh
 * @param {string} baseURL - The base URL for the API
 * @param {Object} options - Additional options
 * @param {boolean} options.cacheBuster - Add timestamp to GET requests (default: true)
 * @returns {AxiosInstance}
 */
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

                // Token exists but got 401 - try to refresh
                if (isRefreshing) {
                    // Wait for the refresh to complete
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject })
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return client(originalRequest)
                    }).catch(err => {
                        return Promise.reject(err)
                    })
                }

                originalRequest._retry = true
                isRefreshing = true

                try {
                    const newToken = await refreshAccessToken()
                    setToken(newToken)
                    processQueue(null, newToken)

                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return client(originalRequest)
                } catch (refreshError) {
                    processQueue(refreshError, null)
                    // Refresh failed - clear token and dispatch session expired event
                    clearToken()
                    if (!isOnLoginPage) {
                        window.dispatchEvent(new CustomEvent('auth:session-expired'))
                    }
                    return Promise.reject(refreshError)
                } finally {
                    isRefreshing = false
                }
            }

            return Promise.reject(error)
        }
    )

    return client
}

export default createAuthClient
