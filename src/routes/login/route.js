import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { getToken } from '@/services/createAuthClient';

export const Route = createFileRoute('/login')({
    validateSearch: z.object({
        redirect: z.string().catch('/'),
    }),
    beforeLoad: ({ context }) => {
        // Only redirect away from login if:
        // 1. User is authenticated via session
        // 2. User has a valid JWT token (prevents redirect loop when JWT expired but session valid)
        const hasJwtToken = !!getToken()

        if (!context.auth.user?.need_to_login && context.auth.isAuthenticated && hasJwtToken) {
            const { auth } = context;

            // Admin redirect - users with restricted neg_id go to Clients (list page)
            if (auth.user?.is_admin) {
                throw redirect({ to: '/list' });
            }

            // Advertiser redirect - users with advertiser role go to Profile page
            if (auth.isAdvertiser) {
                throw redirect({ to: '/advertiser-profile' });
            }

            // Estate Agent redirect (default) - all other authenticated users go to Properties (Marketing)
            throw redirect({ to: '/properties' });
        }
    }
})