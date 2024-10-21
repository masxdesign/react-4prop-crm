import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '@/routes/--ui/PendingComponent'

export const Route = createFileRoute('/_auth/_dashboard/import')({
    pendingComponent: PendingComponent
})