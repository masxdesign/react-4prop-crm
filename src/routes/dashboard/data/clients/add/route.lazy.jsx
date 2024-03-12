import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard/data/clients/add')({
  component: AddComponent
})

function AddComponent() {
  const { FormComponent, formProps } = Route.useRouteContext()

  return (
    <FormComponent {...formProps} />
  )
}