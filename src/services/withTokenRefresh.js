import { getToken, refreshAccessToken } from './createAuthClient'

/** Get auth headers with current token */
export const getAuthHeaders = () => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Check if error is token expiration/invalid */
const isTokenError = (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error || ''
    return status === 401 || message.includes('expired') || message.includes('invalid')
}

/** Wrap API call with auto token refresh on 401 (uses shared queue) */
export const withTokenRefresh = async (apiCall) => {
    try {
        // First attempt with current token
        return await apiCall(getAuthHeaders())
    } catch (error) {
        if (isTokenError(error)) {
            // Token expired/invalid - refresh and retry
            // refreshAccessToken has built-in queue mechanism and stores the token
            try {
                const freshToken = await refreshAccessToken()
                const freshHeaders = { Authorization: `Bearer ${freshToken}` }
                return await apiCall(freshHeaders)
            } catch (refreshError) {
                // Refresh failed - throw original error
                throw error
            }
        }
        throw error
    }
}
