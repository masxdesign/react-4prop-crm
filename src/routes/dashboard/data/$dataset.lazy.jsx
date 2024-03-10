import { Outlet, createLazyFileRoute } from '@tanstack/react-router'
import LinkGroup from '../-components/LinkGroup'

export const Route = createLazyFileRoute('/dashboard/data/$dataset')({
  component: DatasetComponent
})

function DatasetComponent () {
  const { nav } = Route.useRouteContext()
  return (
    <>
      {nav.length > 0 && <LinkGroup items={nav} className='flex justify-start gap-4 px-4' />}
      <Outlet />
    </>
  )
}
