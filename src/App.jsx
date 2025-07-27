import { Suspense, useEffect } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import AuthProvider, { initialAuthState } from './components/Auth/Auth'
import { useAuth } from './components/Auth/Auth'
import queryClient from './queryClient'
import { routeTree } from './routeTree.gen'
import { BASEPATH } from './constants'
import { Loader2 } from 'lucide-react'
import './App.css'
import { BIZCHAT_BASEURL } from './services/bizchatClient'
import { useDevMode } from './utils/use-DevMode'

const router = createRouter({ 
  routeTree,
  basepath: BASEPATH,
  defaultPreload: 'intent',
  scrollRestoration: true,
  getScrollRestorationKey: (location) => location.pathname,
  scrollBehavior: 'instant',
  context: {
    queryClient,
    perpage: 8,
    auth: initialAuthState,
    isBizchatUk: window.location.origin === BIZCHAT_BASEURL
  }
})

const InnerAuth = () => {
  const auth = useAuth()

  useEffect(() => {

    if (import.meta.env.DEV) {
      console.log('auth:', auth);
    }

  }, [auth])

  return (
    <RouterProvider router={router} context={{ auth }} />
  )
}
  
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Suspense 
        fallback={
          <div className="flex items-center justify-center h-screen w-100">
              <Loader2 className="animate-spin w-20 h-20" />
          </div>
        }>
        <AuthProvider>
            <InnerAuth />
        </AuthProvider>
      </Suspense>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App