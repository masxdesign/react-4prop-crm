import './App.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'

export const queryClient = new QueryClient()

const router = createRouter({ 
  routeTree,
  basepath: '/crm',
  context: {
    queryClient
  }
})

const App = () => (
  <TooltipProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </TooltipProvider>
)

export default App