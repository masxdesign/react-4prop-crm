import { createFileRoute } from '@tanstack/react-router';
import PendingComponent from '../../../-ui/PendingComponent';

export const Route = createFileRoute('/dashboard/data/clients/import')({
    pendingComponent: PendingComponent
})