import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/grade/_gradeWidget/$pid/share/')({
  component: () => <div>Hello /_auth/integrate-share/add-client!</div>
})