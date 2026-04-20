import { useEffect } from 'react'
import { fourPropClient, isSameOriginAsFourProp } from '@/services/fourPropClient'
import { getToken } from '@/services/createAuthClient'

/**
 * Same-origin only: when the CRM tab regains focus, reconcile CRM auth with
 * the PHP session on the main site.
 *
 *   - CRM has token, PHP session gone → dispatch auth:session-expired
 *     (covers admin logout; also tears down an active impersonation since
 *      impersonation requires an admin PHP session).
 *   - CRM has no token, PHP session alive → reload so the boot whoisonline
 *     call mints a JWT from the PHP session.
 */
export const useSessionSync = () => {
    useEffect(() => {
        if (!isSameOriginAsFourProp()) return

        let checking = false

        const check = async () => {
            if (checking) return
            checking = true
            try {
                const { data } = await fourPropClient.post('api/login', null, {
                    headers: {},
                    params: { _sessionCheck: 1 },
                })
                const sessionAlive = !!data && !!data.id && !data.need_to_login
                const hasToken = !!getToken()

                if (hasToken && !sessionAlive) {
                    window.dispatchEvent(new CustomEvent('auth:session-expired'))
                } else if (!hasToken && sessionAlive) {
                    window.location.reload()
                }
            } catch {
                if (getToken()) {
                    window.dispatchEvent(new CustomEvent('auth:session-expired'))
                }
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
