import { fourPropClient } from './fourPropClient'
import { setToken, setImpersonating } from './createAuthClient'
import { withTokenRefresh } from './withTokenRefresh'

/** Start impersonating a target user by their neg_id (agent) or user_id (advertiser) */
export const impersonate = async ({ targetNegId, targetUserId }) => {
    const payload = targetNegId ? { targetNegId } : { targetUserId }
    const data = await withTokenRefresh(async (headers) => {
        const { data } = await fourPropClient.post('/api/impersonate', payload, { headers })
        return data
    })
    if (data.token) {
        setToken(data.token)
        setImpersonating(true)
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
    setImpersonating(false)
    return data
}
