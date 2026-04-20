import { useEffect } from 'react'
import { fourPropClient, isSameOriginAsFourProp } from '@/services/fourPropClient'
import { getToken } from '@/services/createAuthClient'

/**
 * Same-origin only: when the CRM tab regains focus, verify the PHP session is
 * still alive. If it's gone (user logged out on the main site), dispatch
 * auth:session-expired so AuthProvider tears the CRM session down too.
 *
 * Applies to impersonation as well — impersonation requires an admin PHP
 * session; if that's gone, the impersonation token must also be cleared.
 */
export const useSessionSync = () => {
    useEffect(() => {
        if (!isSameOriginAsFourProp()) return

        let checking = false

        const check = async () => {
            if (checking) return
            if (!getToken()) return
            checking = true
            try {
                const { data } = await fourPropClient.post('api/login', null, {
                    headers: {},
                    params: { _sessionCheck: 1 },
                })
                const sessionAlive = !!data && !!data.id && !data.need_to_login
                if (!sessionAlive) {
                    window.dispatchEvent(new CustomEvent('auth:session-expired'))
                }
            } catch {
                window.dispatchEvent(new CustomEvent('auth:session-expired'))
            } finally {
                checking = false
            }
        }

        const onVisibility = () => {
            if (document.visibilityState === 'visible') check()
        }

        window.addEventListener('focus', check)
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            window.removeEventListener('focus', check)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [])
}

export default useSessionSync
