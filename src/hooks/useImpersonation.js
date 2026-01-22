import { useMutation } from '@tanstack/react-query'
import { useAuthContext, useAuthDispatch } from '@/components/Auth/Auth-context'
import { authCombiner } from '@/components/Auth/Auth'
import { impersonate, exitImpersonation } from '@/services/impersonation'

/** Hook for managing admin impersonation state and actions */
export const useImpersonation = () => {
    const auth = useAuthContext()
    const setAuth = useAuthDispatch()

    const impersonateMutation = useMutation({
        mutationFn: ({ targetNegId, targetUserId, redirectTo }) => impersonate({ targetNegId, targetUserId }),
        onSuccess: (data, variables) => {
            // setAuth(authCombiner(data.targetUser, {
            //     isImpersonating: true,
            //     originalUser: data.originalUser
            // }))
            if (variables.redirectTo) {
                window.location.href = variables.redirectTo
            } else {
                window.location.reload()
            }
        }
    })

    const exitMutation = useMutation({
        mutationFn: exitImpersonation,
        onSuccess: (data) => {
            // setAuth(authCombiner(data.user, {
            //     isImpersonating: false,
            //     originalUser: null
            // }))

            // Check for saved return state from impersonation
            const savedReturnState = localStorage.getItem('impersonation_return_state')
            if (savedReturnState) {
                try {
                    const returnState = JSON.parse(savedReturnState)
                    localStorage.removeItem('impersonation_return_state')
                    window.location.href = returnState.pathname + (returnState.search || '')
                    return
                } catch (e) {
                    localStorage.removeItem('impersonation_return_state')
                }
            }

            window.location.reload()
        }
    })

    return {
        isImpersonating: auth.isImpersonating || false,
        originalUser: auth.originalUser || null,
        impersonate: impersonateMutation.mutate,
        exitImpersonation: exitMutation.mutate,
        isImpersonatePending: impersonateMutation.isPending,
        isExitPending: exitMutation.isPending
    }
}
