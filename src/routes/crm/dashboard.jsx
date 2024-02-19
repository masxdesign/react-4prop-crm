import { useAuthStore } from '@/store';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/crm/dashboard')({
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
    pendingComponent: () => {
        return <span>Loading...</span>
    }
})