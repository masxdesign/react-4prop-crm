import clientsQueryOptions from '@/api/clientsQueryOptions';
import { createFileRoute } from '@tanstack/react-router';
import PendingComponent from '../-components/PendingComponent';

export const Route = createFileRoute('/dashboard/')({
    loader: async ({ context: { queryClient } }) => queryClient.ensureQueryData(clientsQueryOptions),
    pendingComponent: PendingComponent
})