import { fetchNegotiators } from '@/api/fourProp'
import PendingComponent from '@/routes/dashboard/-ui/PendingComponent'
import { init } from '@/hooks/use-tableState'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/data/each/list')({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async ({ search }) => {

    const tableName = 'd.v1.each'

    const tableState = init(search)

    const { columns } = await import('./-ui/columns-each')

    return {
      tableName,
      columns,
      queryOptions: queryOptions({ 
        queryKey: [tableName, tableState.columnFilters, tableState.sorting, tableState.pagination], 
        queryFn: () => fetchNegotiators(tableState), 
        staleTime: 60_000
      })
    }

  }
})