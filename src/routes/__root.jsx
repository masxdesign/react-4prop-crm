import { Suspense } from 'react'
import TanStackRouterDevtools from '@/components/TanStackRouterDevtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { inIframe } from '@/utils/iframeHelpers'
import PendingComponent from '@/components/PendingComponent'

export const Route = createRootRoute({
  component: RouteRootComponent,
  pendingComponent: PendingComponent
})

const isInIframe = inIframe()

function RouteRootComponent() {

  return (
    <>
      <Outlet />
      {/* {!isInIframe && (
        <Suspense>
            <TanStackRouterDevtools />
        </Suspense>
      )} */}
    </>
  )
}