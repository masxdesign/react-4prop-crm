import React from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import CRMTable from '@/components/CRMTable/CRMTable';
import TableDialogMetricsMyList from '@/components/CRMTable/components/TableDialogMetricsMyList';
import PendingComponent from '@/components/PendingComponent';

export const Route = createLazyFileRoute('/_auth/_dashboard/list')({
    component: ListComponent,
    pendingComponent: PendingComponent,
})

function ListComponent() {
  const { 
    tableName, 
    tableVersion,
    defaultTableModelState,
    tableDialogRenderMessages, 
    columns, 
    facets, 
    services, 
    authUserId,
    userCardComponent
  } = Route.useRouteContext()

  const navigate = useNavigate({ from: "/dashboard/list" })

  return (
    <CRMTable  
      tableName={tableName}
      tableVersion={tableVersion}
      services={services}
      authUserId={authUserId}
      columns={columns}
      facets={facets}
      navigate={navigate}
      userCardComponent={userCardComponent}
      defaultTableModelState={defaultTableModelState}
      tableDialogRenderMessages={tableDialogRenderMessages}
      tableDialogMetricsComponent={TableDialogMetricsMyList}
    />
  )
}