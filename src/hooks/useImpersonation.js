import { useMutation } from '@tanstack/react-query'
import { useAuthContext, useAuthDispatch } from '@/components/Auth/Auth-context'
import { authCombiner } from '@/components/Auth/Auth'
import { impersonate, exitImpersonation } from '@/services/impersonation'

/** Hook for managing admin impersonation state and actions */
export const useImpersonation = () => {
    const auth = useAuthContext()
    const setAuth = useAuthDispatch()

    const impersonateMutation = useMutation({
        mutationFn: impersonate,
        onSuccess: (data) => {
            // setAuth(authCombiner(data.targetUser, {
            //     isImpersonating: true,
            //     originalUser: data.originalUser
            // }))
            window.location.reload()
        }
    })

    const exitMutation = useMutation({
        mutationFn: exitImpersonation,
        onSuccess: (data) => {
            // setAuth(authCombiner(data.user, {
            //     isImpersonating: false,
            //     originalUser: null
            // }))
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
