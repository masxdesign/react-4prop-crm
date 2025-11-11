import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/agentb/$advertiser_id/listing')({
  component: () => <div>Hello /_agentb/listing!</div>
})