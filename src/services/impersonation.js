import { fourPropClient } from './fourPropClient'
import { setToken } from './createAuthClient'
import { withTokenRefresh } from './withTokenRefresh'

/** Start impersonating a target agent by their neg_id */
export const impersonate = async (targetNegId) => {
    const data = await withTokenRefresh(async (headers) => {
        const { data } = await fourPropClient.post('/api/impersonate', { targetNegId }, { headers })
        return data
    })
    if (data.token) {
        setToken(data.token)
    }
    return data
}

/** Exit impersonation and return to admin account */
export const exitImpersonation = async () => {
    const data = await withTokenRefresh(async (headers) => {
        const { data } = await fourPropClient.post('/api/impersonate/exit', {}, { headers })
        return data
    })
    if (data.token) {
        setToken(data.token)
    }
    return data
}
