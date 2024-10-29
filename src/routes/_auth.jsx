import { createFileRoute, redirect } from '@tanstack/react-router';
import PendingComponent from '@/components/PendingComponent';
import { WINDOWN_NAMES } from '@/constants';

export const Route = createFileRoute('/_auth')({
    beforeLoad: ({ context, location }) => {
        if (!context.auth.isAuthenticated) {
          throw redirect({
            to: '/crm/login',
            search: {
              redirect: location.href
            }
          })
        }
        window.name = WINDOWN_NAMES.auth
    },
    pendingComponent: PendingComponent
})