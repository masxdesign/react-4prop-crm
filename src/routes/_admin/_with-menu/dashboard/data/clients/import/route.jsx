import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '../../../-ui/PendingComponent'

export const Route = createFileRoute('/_admin/_with-menu/dashboard/data/clients/import')({
    pendingComponent: PendingComponent
})