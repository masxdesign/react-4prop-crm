import TanStackRouterDevtools from '@/components/TanStackRouterDevtools'
import { useAuthStore } from '@/store'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createRootRoute({
  beforeLoad: () => useAuthStore.getState().whoisloggedin(),
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