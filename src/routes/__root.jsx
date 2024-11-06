import { Suspense } from 'react'
import TanStackRouterDevtools from '@/components/TanStackRouterDevtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { inIframe } from '@/utils/iframeHelpers'

export const Route = createRootRoute({
  component: RouteRootComponent
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