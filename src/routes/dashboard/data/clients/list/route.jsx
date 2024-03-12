import PendingComponent from '@/routes/dashboard/-ui/PendingComponent'
import { init } from '@/routes/dashboard/-ui/use-tableState'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/data/clients/list')({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async ({ search }) => {

    const tableName = 'd.v1.clients'

    const tableState = init(search)

    const { columns } = await import('./-ui/columns-clients')
    const { fetchClientsPagin } = await import('@/api/api-fakeServer')

    return {
      tableName,
      columns,
      queryOptions: queryOptions({ 
        queryKey: [tableName, tableState.columnFilters, tableState.sorting, tableState.pagination], 
        queryFn: () => fetchClientsPagin(tableState), 
        staleTime: 60_000
      })
    }

  }
})