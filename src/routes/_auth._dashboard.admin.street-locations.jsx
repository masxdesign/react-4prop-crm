import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_dashboard/admin/street-locations')({
  beforeLoad: ({ context }) => {
    if (!context.auth?.user?.is_admin) {
      throw redirect({ to: '/' })
    }
  },
  component: function StreetLocationsLayout() {
    return <Outlet />
  },
})
