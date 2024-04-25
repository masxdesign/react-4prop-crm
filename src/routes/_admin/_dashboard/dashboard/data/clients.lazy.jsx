import { Outlet, createLazyFileRoute } from '@tanstack/react-router'
import LinkGroup from '../-ui/LinkGroup'

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