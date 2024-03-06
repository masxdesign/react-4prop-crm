import { createFileRoute } from '@tanstack/react-router';
import PendingComponent from '../-components/PendingComponent';

export const Route = createFileRoute('/crm/dashboard/import')({
    pendingComponent: PendingComponent
})