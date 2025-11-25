import { Suspense } from 'react'
import TanStackRouterDevtools from '@/components/TanStackRouterDevtools'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { inIframe } from '@/utils/iframeHelpers'
import PendingComponent from '@/components/PendingComponent'

export const Route = createRootRoute({
  component: RouteRootComponent,
  pendingComponent: PendingComponent,
  notFoundComponent: () => {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Page Not Found</p>
          <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  },
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