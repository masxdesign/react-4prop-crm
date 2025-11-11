import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/login')({
    validateSearch: z.object({
        redirect: z.string().catch('/'),
    }),
    beforeLoad: ({ context }) => {
        if(!context.auth.user?.need_to_login && context.auth.isAuthenticated) {
            const { auth } = context;

            // Admin redirect - users with restricted neg_id go to Clients (list page)
            if (auth.user?.is_admin) {
                throw redirect({ to: '/crm/list' });
            }

            // Advertiser redirect - users with advertiser role go to Profile page
            if (auth.isAdvertiser) {
                throw redirect({ to: '/crm/advertiser-profile' });
            }

            // Estate Agent redirect (default) - all other authenticated users go to Properties (Marketing)
            throw redirect({ to: '/crm/mag' });
        }
    }
})