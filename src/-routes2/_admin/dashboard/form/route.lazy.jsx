import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_admin/dashboard/form')({
  component: () => <div>Hello /dashboard/form!</div>
})