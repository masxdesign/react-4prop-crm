import { Suspense } from 'react'
import TanStackRouterDevtools from '@/components/TanStackRouterDevtools'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { inIframe } from '@/utils/iframeHelpers'
import PendingComponent from '@/components/PendingComponent'
import ErrorComponent from '@/components/ErrorComponent'

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
  errorComponent: ({ error, reset }) => {
    console.error('Root Route Error:', error);
    return <ErrorComponent error={error} reset={reset} />;
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