import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/grade/share/success')({
  component: () => <div>Hello /_auth/_grade/integrate-grade-share/$pid/shared!</div>
})