import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/agentb/$advertiser_id/')({
  component: () => <div>Index</div>
})