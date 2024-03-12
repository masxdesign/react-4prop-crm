import PendingComponent from '@/routes/dashboard/-ui/PendingComponent'
import { init } from '@/routes/dashboard/-ui/use-tableState'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/data/each/list')({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async ({ search }) => {

    const tableState = init(search)

    const { columns } = await import('./-ui/columns-each')
    const { fetchNegotiators } = await import('@/api/fourProp')

    return {
      tableProps: {
        columns,
        toolbar: false
      },
      sheetProps: {
        component: () => null,
        editMode: false
      },
      queryOptions: queryOptions({ 
        queryKey: ['each', tableState.columnFilters, tableState.sorting, tableState.pagination], 
        queryFn: () => fetchNegotiators(tableState), 
        staleTime: 60_000
      })
    }

  }
})