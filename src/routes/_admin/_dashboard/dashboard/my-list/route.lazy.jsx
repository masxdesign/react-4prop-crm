import React from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import CRMTable from '@/components/CRMTable/CRMTable';

export const Route = createLazyFileRoute('/_admin/_dashboard/dashboard/my-list')({
    component: ListComponent
})

function ListComponent() {
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

  const navigate = useNavigate({ from: "/dashboard/my-list" })

  return (
    <CRMTable  
      tableName={tableName}
      services={services}
      authUserId={authUserId}
      columns={columns}
      facets={facets}
      navigate={navigate}
      userCardComponent={userCardComponent}
      defaultTableModelState={defaultTableModelState}
      tableDialogRenderMessages={tableDialogRenderMessages}
    />
  )
}