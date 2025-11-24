import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/agentb_/$advertiser_id/')({
  component: () => <div>Index</div>
})