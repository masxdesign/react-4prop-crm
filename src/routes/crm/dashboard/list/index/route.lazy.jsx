import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/crm/dashboard/list/')({
  component: IndexComponent
})

function IndexComponent() {
  return (
    <p>I'm found under... /crm/dashboard/list/</p>
  )
}