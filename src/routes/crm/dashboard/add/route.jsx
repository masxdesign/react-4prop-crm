import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/crm/dashboard/add')({
  pendingComponent: () => {
    return <span>Loading...</span>
  }
})