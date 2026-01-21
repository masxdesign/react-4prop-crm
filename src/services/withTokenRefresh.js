import { getToken, setToken, refreshAccessToken } from './createAuthClient'

/** Get auth headers with current token */
export const getAuthHeaders = () => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Check if error is a token expiration/invalid error */
const isTokenError = (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error || ''
    return status === 401 || message.includes('expired') || message.includes('invalid')
}

/**
 * Wrapper that executes an API call with automatic token refresh on expiration
 * @param {Function} apiCall - Function that makes the API call, receives headers as argument
 * @returns {Promise} - Result of the API call
 *
 * @example
 * const data = await withTokenRefresh(async (headers) => {
 *     const { data } = await fourPropClient.post('/api/endpoint', body, { headers })
 *     return data
 * })
 */
export const withTokenRefresh = async (apiCall) => {
    try {
        // First attempt with current token
        return await apiCall(getAuthHeaders())
    } catch (error) {
        if (isTokenError(error)) {
            // Token expired/invalid - refresh and retry
            try {
                const freshToken = await refreshAccessToken()
                if (freshToken) {
                    setToken(freshToken)
                    const freshHeaders = { Authorization: `Bearer ${freshToken}` }
                    return await apiCall(freshHeaders)
                }
            } catch (refreshError) {
                // Refresh failed - throw original error
                throw error
            }
        }
        throw error
    }
}
