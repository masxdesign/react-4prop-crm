import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard/list/')({
  component: IndexComponent
})

function IndexComponent() {
  return (
    <p>I'm found under... /crm/dashboard/list/</p>
  )
}