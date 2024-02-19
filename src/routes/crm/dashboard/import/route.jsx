import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/crm/dashboard/import')({
    pendingComponent: () => {
        return <span>Loading...</span>
    }
})