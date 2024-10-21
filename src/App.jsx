import { Suspense } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import AuthProvider from './components/Auth/Auth'
import { useAuth } from './components/Auth/Auth-context'
import queryClient from './queryClient'
import { routeTree } from './routeTree.gen'
import './App.css'

const router = createRouter({ 
  routeTree,
  basepath: '/crm',
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
      <Suspense fallback={<p>Loading...</p>}>
        <AuthProvider>
            <InnerAuth />
        </AuthProvider>
      </Suspense>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App