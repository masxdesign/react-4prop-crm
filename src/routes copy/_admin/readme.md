import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/readme/md')({
  component: () => <div>Hello /_layout/readme/md!</div>
})