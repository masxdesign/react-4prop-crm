import PendingComponent from '@/components/PendingComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/grade/$pid/share/_first_screen/')({
  pendingComponent: PendingComponent
})