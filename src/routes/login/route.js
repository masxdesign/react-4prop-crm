import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/login')({
    validateSearch: z.object({
        redirect: z.string().catch('/'),
    }),
    beforeLoad: ({ context }) => {
        if(!context.auth.user?.need_to_login && context.auth.isAuthenticated) {
            throw redirect({ to: '/crm/list' })
        }
    }
})