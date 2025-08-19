import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/agentb/$advertiser_id')({
  component: () => {
    return (
      <div>
        <p>agentB parent</p>
        <Outlet />
      </div>
    )
  }
})