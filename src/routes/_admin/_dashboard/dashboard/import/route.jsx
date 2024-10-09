import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '@/routes/-ui/PendingComponent'

export const Route = createFileRoute('/_admin/_dashboard/dashboard/import')({
    pendingComponent: PendingComponent
})