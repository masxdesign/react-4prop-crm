import PendingComponent from '@/routes/dashboard/-components/PendingComponent'
import { init } from '@/routes/dashboard/-hooks/use-tableState'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/data/$dataset/list')({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async ({ params, search }) => {

    let columns_ = []
    let queryFn
    let toolbar = false
    let readOnly = true

    const tableState = init(search)
    
    switch (params.dataset) {
      case 'clients': {

          const { columns } = await import('./-columns/clients')
          const { fetchClientsPagin } = await import('@/api/api-fakeServer')
          
          columns_ = columns
          queryFn = () => fetchClientsPagin(tableState)
          readOnly = false
          toolbar = true
          
          break
          
        }
        case 'each': {
          
          const { columns } = await import('./-columns/each')
          const { fetchNegotiators } = await import('@/api/fourProp')
          
          columns_ = columns
          queryFn = () => fetchNegotiators(tableState)
          readOnly = true
          toolbar = false
        
        }
    }

    return {
      tableProps: {
        columns: columns_,
        toolbar
      },
      sheetProps: {
        readOnly
      },
      queryOptions: queryOptions({ 
        queryKey: [params.dataset, tableState.columnFilters, tableState.sorting, tableState.pagination], 
        queryFn, 
        staleTime: 60_000
      })
    }

  }
})