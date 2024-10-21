import { Suspense } from 'react'
import TanStackRouterDevtools from '@/components/TanStackRouterDevtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RouteRootComponent
})

function RouteRootComponent() {

  return (
    <>
      <Outlet />
      <Suspense>
          <TanStackRouterDevtools />
      </Suspense>
    </>
  )
}