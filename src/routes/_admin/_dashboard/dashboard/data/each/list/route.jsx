import { createFileRoute } from '@tanstack/react-router'
import { defaultTableModelState } from '@/hooks/use-TableModel'
import PendingComponent from '@/routes/-ui/PendingComponent'

export const Route = createFileRoute('/_admin/_dashboard/dashboard/data/each/list')({
  // loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async () => {
    const { columns, version } = await import('./-ui/columns-each')

    return {
      tableName:  `d.${version}.each`,
      defaultTableModelState: {
        ...defaultTableModelState,
        tableState: {
          ...defaultTableModelState.tableState,
          sorting: [{ id: "last_contact", desc: true }]
        }
      },
      columns,
    }
  }
})