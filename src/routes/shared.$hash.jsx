import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shared/$hash')({
  component: () => <div>Hello /(client-portal)/shared/$hash!</div>
})