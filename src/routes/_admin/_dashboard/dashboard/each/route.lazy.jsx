import React from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import CRMTable from '@/components/CRMTable/CRMTable';
import TableDialogMetricsEach from '@/components/CRMTable/components/TableDialogMetricsEach';

export const Route = createLazyFileRoute('/_admin/_dashboard/dashboard/each')({
    component: ClientsListComponent
})

function ClientsListComponent() {
  const { 
    tableName, 
    defaultTableModelState,
    tableDialogRenderMessages, 
    columns, 
    facets, 
    services, 
    authUserId,
    userCardComponent
  } = Route.useRouteContext()

  const navigate = useNavigate({ from: "/dashboard/data/each/list" })

  return (
    <CRMTable  
      tableName={tableName}
      tableDialogRenderMessages={tableDialogRenderMessages}
      services={services}
      authUserId={authUserId}
      columns={columns}
      facets={facets}
      navigate={navigate}
      userCardComponent={userCardComponent}
      defaultTableModelState={defaultTableModelState}
      tableDialogMetricsComponent={TableDialogMetricsEach}
      eachEmailCompaignsLink
    />
  )
}