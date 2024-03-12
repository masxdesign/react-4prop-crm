import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/data/clients/list')({
  component: () => <div>Hello /dashboard/data/clients/list!</div>
})