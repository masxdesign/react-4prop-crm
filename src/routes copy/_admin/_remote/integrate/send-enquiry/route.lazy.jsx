import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_admin/remote/send-enquiry')({
  component: () => <div>Hello /dashboard/form!</div>
})