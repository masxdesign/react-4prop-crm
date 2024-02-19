import categoriesQueryOptions from '@/api/categoriesQueryOptions';
import clientsQueryOptions from '@/api/clientsQueryOptions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/crm/dashboard/')({
    loader: async ({ context: { queryClient } }) => queryClient.ensureQueryData(clientsQueryOptions),
    pendingComponent: () => {
        return <span>Loading...</span>
    }
})