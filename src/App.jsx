import { Suspense } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import AuthProvider from './components/Auth/Auth'
import { useAuth } from './components/Auth/Auth-context'
import queryClient from './queryClient'
import { routeTree } from './routeTree.gen'
import './App.css'
import { BASEPATH } from './constants'
import { Loader2 } from 'lucide-react'

const router = createRouter({ 
  routeTree,
  basepath: BASEPATH,
  defaultPreload: 'intent',
  context: {
    queryClient,
    auth: null
  }
})

const InnerAuth = () => {
  const auth = useAuth()

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