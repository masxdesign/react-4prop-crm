import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '../../-components/PendingComponent'
import { tableStateLoaderDeps } from '../../-hooks/use-tableState';
import tableQueryOptions from '@/api/tableQueryOptions';

export const Route = createFileRoute('/crm/dashboard/list/$dataset')({
  loader: ({ context, params, deps }) => context.queryClient.ensureQueryData(tableQueryOptions(params.dataset, deps)),
  loaderDeps: tableStateLoaderDeps,
  pendingComponent: PendingComponent
})