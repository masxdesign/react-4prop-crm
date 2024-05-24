import { createFileRoute } from '@tanstack/react-router'
import { tableStateURLSearchParamsReceived } from '@/hooks/use-TableModel'
import PendingComponent from '@/routes/-ui/PendingComponent'

export const Route = createFileRoute('/_admin/_dashboard/dashboard/data/each/list')({
  // loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async ({ search }) => {
    const { columns, version } = await import('./-ui/columns-each')

    return {
      tableName:  `d.${version}.each`,
      tableModelInit: tableStateURLSearchParamsReceived({ 
        ...search,
        sorting: [{ id: "next_contact", desc: true }]
      }),
      columns,
    }
  }
})