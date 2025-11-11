import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/agentb/$advertiser_id/details/$pid')({
  component: () => <div>Hello /_agentb/details/$pid!</div>
})