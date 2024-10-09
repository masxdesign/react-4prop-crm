import LinkGroup from '@/routes/-ui/LinkGroup'
import { Outlet, createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_admin/_dashboard/dashboard/data/clients')({
  component: () => {
    const { nav } = Route.useRouteContext()

    return (
      <>
        <LinkGroup items={nav} className='flex justify-start gap-4 px-4' />
        <Outlet />
      </>
    )
  }
})