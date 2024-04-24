import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '../../../-ui/PendingComponent'
import { tableStateURLSearchParamsReceived } from '@/hooks/use-TableModel'

export const Route = createFileRoute('/_admin/_with-menu/dashboard/data/each/list')({
  // loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async ({ search }) => {
    const { columns } = await import('./-ui/columns-each')

    return {
      tableName:  'd.v1.each',
      tableModelInit: tableStateURLSearchParamsReceived(search),
      columns,
    }
  }
})