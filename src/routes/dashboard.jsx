import { useAuthStore } from '@/store';
import { createFileRoute, redirect } from '@tanstack/react-router';
import PendingComponent from './dashboard/-components/PendingComponent';

export const Route = createFileRoute('/dashboard')({
    beforeLoad: ({ location }) => {
        const { user } = useAuthStore.getState()
        
        if(!user) {
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