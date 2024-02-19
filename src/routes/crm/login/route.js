import { useAuthStore } from '@/store';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/crm/login')({
    validateSearch: z.object({
        redirect: z.string().catch('/'),
    }),
    beforeLoad: () => {
        const { user } = useAuthStore.getState()
        
        if(user) {
            throw redirect({ to: '/crm/dashboard/' })
        }
    }
})