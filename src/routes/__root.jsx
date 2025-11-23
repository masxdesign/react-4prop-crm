import { Suspense } from 'react'
import TanStackRouterDevtools from '@/components/TanStackRouterDevtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { inIframe } from '@/utils/iframeHelpers'
import PendingComponent from '@/components/PendingComponent'

export const Route = createRootRoute({
  component: RouteRootComponent,
  pendingComponent: PendingComponent,
  errorComponent: ({ error }) => {
    console.error('Root Route Error:', error);
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <pre className="bg-red-50 p-4 rounded overflow-auto">
          {error?.message || String(error)}
        </pre>
        {error?.stack && (
          <pre className="bg-gray-50 p-4 rounded overflow-auto mt-2 text-xs">
            {error.stack}
          </pre>
        )}
      </div>
    );
  }
})

const isInIframe = inIframe()

function RouteRootComponent() {

  return (
    <>
      <Outlet />
      {!isInIframe && (
        <Suspense>
            <TanStackRouterDevtools />
        </Suspense>
      )}
    </>
  )
}