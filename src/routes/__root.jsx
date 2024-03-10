import TanStackRouterDevtools from '@/components/TanStackRouterDevtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'

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