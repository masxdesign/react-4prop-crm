import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/_com/agent')({
  component: RouteComponent
})

function RouteComponent() {
  return (
      <p>
          ddd
      </p>
  )
}