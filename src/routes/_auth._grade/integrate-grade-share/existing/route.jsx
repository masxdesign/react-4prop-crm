import PendingComponent from '@/components/PendingComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_grade/integrate-grade-share/existing')({
  pendingComponent: PendingComponent
})