import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/agentb_/$advertiser_id/listing')({
  component: () => <div>Hello /_agentb/listing!</div>
})