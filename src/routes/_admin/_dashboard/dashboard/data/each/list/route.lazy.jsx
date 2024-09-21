import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import CRMTable from '@/components/CRMTable/CRMTable';

export const Route = createLazyFileRoute('/_admin/_dashboard/dashboard/data/each/list')({
    component: ClientsListComponent
})

function ClientsListComponent() {
  const { tableName, defaultTableModelState, columns, auth } = Route.useRouteContext()

  return (
    <CRMTable  
      tableName={tableName}
      defaultTableModelState={defaultTableModelState}
      columns={columns}
      auth={auth}
    />
  )
}