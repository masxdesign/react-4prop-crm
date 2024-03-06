import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '../../-components/PendingComponent'
import { init } from '../../-hooks/use-tableState';
import { fetchNegotiators } from '@/api/fourProp';
import { queryOptions } from '@tanstack/react-query';
import { fetchClientsPagin } from '@/api/api-fakeServer';

export const Route = createFileRoute('/crm/dashboard/list/$dataset')({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async ({ search, params }) => {

    const tableState = init(search)

    let columns_
    let queryFn
    
    switch (params.dataset) {
      case 'clients':
        const { columns } = await import('./-columns')
        const { fetchClientsPagin } = await import('@/api/api-fakeServer')
        
        columns_ = columns
        queryFn = () => fetchClientsPagin(tableState)
        
        break
      case 'each':
        const { fetchNegotiators } = await import('@/api/fourProp')
        queryFn = () => fetchNegotiators(tableState)
    }

    return {
      columns: columns_,
      queryOptions: queryOptions({ 
        queryKey: [params.dataset, tableState.columnFilters, tableState.sorting, tableState.pagination], 
        queryFn, 
        staleTime: 60_000
    })
    }
  }
})