import PendingComponent from '@/routes/-ui/PendingComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/_dashboard/dashboard/data/clients/import')({
    pendingComponent: PendingComponent
})