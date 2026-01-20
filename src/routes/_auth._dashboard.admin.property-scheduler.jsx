import { createFileRoute, redirect } from '@tanstack/react-router'
import PropertySchedulerForm from '@/components/PropertyScheduler/PropertySchedulerForm'
import { schedulerQueriesQueryOptions } from '@/features/propertyScheduler/services'

export const Route = createFileRoute('/_auth/_dashboard/admin/property-scheduler')({
  beforeLoad: ({ context }) => {
    if (!context.auth?.user?.is_admin) {
      throw redirect({ to: '/' })
    }
    return {
      ...context,
      queriesQueryOptions: schedulerQueriesQueryOptions(),
    }
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(context.queriesQueryOptions)
  },
  component: function PropertySchedulerPage() {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6">
          <PropertySchedulerForm />
        </div>
      </div>
    )
  },
})
