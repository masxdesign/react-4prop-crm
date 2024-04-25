import { createFileRoute, redirect } from '@tanstack/react-router';
import PendingComponent from './-ui/PendingComponent';

export const Route = createFileRoute('/dashboard')({
    beforeLoad: ({ context, location }) => {
        if (!context.auth.isAuthenticated) {
          throw redirect({
            to: '/crm/login',
            search: {
              redirect: location.href
            }
          })
        }
    },
    pendingComponent: PendingComponent
})