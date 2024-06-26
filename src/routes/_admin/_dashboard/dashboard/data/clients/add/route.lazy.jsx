import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_admin/_dashboard/dashboard/data/clients/add')({
  component: () => {
    const { FormComponent, formProps } = Route.useRouteContext()

    return (
      <FormComponent {...formProps} />
    )
  }
})