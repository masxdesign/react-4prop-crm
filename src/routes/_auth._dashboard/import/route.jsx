import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '@/components/PendingComponent'

export const Route = createFileRoute('/_auth/_dashboard/import')({
    pendingComponent: PendingComponent,
    beforeLoad: () => ({
        title: "Import clients and applicants",
    })
})