import { createFileRoute, redirect } from '@tanstack/react-router';
import PendingComponent from './dashboard/-components/PendingComponent';

export const Route = createFileRoute('/dashboard')({
    beforeLoad: ({ context, location }) => {
      console.log(context);
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