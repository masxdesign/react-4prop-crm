import React from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import CRMTable from '@/components/CRMTable/CRMTable';
import TableDialogMetricsMyList from '@/components/CRMTable/components/TableDialogMetricsMyList';
import PendingComponent from '@/components/PendingComponent';
import { Mailbox, Share2Icon, User2 } from 'lucide-react';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';

export const Route = createLazyFileRoute('/_auth/_dashboard/list')({
    component: ListComponent,
    pendingComponent: PendingComponent,
})

const tabs = [
    { icon: <User2 className='size-4' />, name: 'Info', id: 'info' },
    { icon: <EnvelopeClosedIcon className='size-4' />, name: 'Enquiries', id: 'enquiries' },
    { icon: <Share2Icon className='size-4' />, name: 'Shared', id: 'shared' },
]

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
      dialogTabs={tabs}
      defaultDialogActiveTab={tabs[0]}
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