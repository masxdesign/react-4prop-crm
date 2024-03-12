import { createLazyFileRoute } from '@tanstack/react-router'
import useTableState from '../../../../../hooks/use-tableState';
import useSheetState from '@/hooks/use-sheetState';
import { useMemo } from 'react';
import DataTableSS from '@/components/DataTableSS';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProgressCircle from '@/routes/dashboard/-ui/ProgressCircle';
import AlertEmailClick from '@/routes/dashboard/-ui/AlertEmailClick';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatboxEach from './-ui/ChatboxEach';

const Dd = ({ label, value }) => (
  <div className='flex flex-row gap-4'>
    <div className='basis-1/5 min-w-[60px] max-w-[80px] text-muted-foreground'>{label}</div>
    <div className='basis-4/5 truncate'>{value}</div>
  </div>
)

const DD = ({ label, info, name }) => {
  const value = info.row.original[name]

  return (
    <Dd 
      label={label}
      value={(
        'email' === name ? (
          <a href={`mailto: ${value}`} className='hover:underline'>
            {value}
          </a>
        ) : 'phone' === name ? (
          <a href={`tel: ${value}`} className='hover:underline'>
            {value}
          </a>
        ) : 'website' === name ? (
          <a href={`https://www.${value}`} target='__blank' className='hover:underline'>
            {value}
          </a>
        ) : (
          <>
            {value}
          </>
        )
      )}
    />
  )
}

export const Route = createLazyFileRoute('/dashboard/data/each/list')({
    component: ClientsListComponent
})

function ClientsListComponent() {
  const { tableName, queryOptions, columns } = Route.useRouteContext()
  
  const tableProps = useTableState({ queryOptions })

  const [infoDialog, dialog, showDialog] = useSheetState()

  const meta = useMemo(() => ({ 
    dataQueryKey: queryOptions.queryKey,
    showDialog
  }), [queryOptions.queryKey])

  return (
    <>
      <div className='overflow-hidden p-4'>
        <DataTableSS 
          tableName={tableName}
          columns={columns}
          meta={meta}
          {...tableProps}
        />
        {infoDialog && (
          <Dialog {...dialog}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">                
                <ResizablePanelGroup
                  direction="horizontal"
                  className="min-h-[200px]"
                >
                  <ResizablePanel defaultSize={40} minSize={30} maxSize={50} className='p-4 space-y-4'>
                    <DialogHeader>
                      <DialogTitle className="capitalize">
                        {infoDialog.row.getValue('fullName')}
                      </DialogTitle>
                    </DialogHeader>
                    <div className='text-sm space-y-2'>
                      {[
                        { label: "ID", name: "id" },
                        { label: "Email", name: "email" },
                        { label: "Phone", name: "phone" },
                        { label: "Company", name: "company" },
                        { label: "Website", name: "website" },
                        { label: "City", name: "city" },
                        { label: "Postcode", name: "postcode" }
                      ].map((props) => (
                        <DD key={props.name} info={infoDialog} {...props} />
                      ))}
                      <div className='h-3' />
                      <div className='flex flex-col gap-4'>
                        <Dd label="Alert" value={<AlertEmailClick info={infoDialog} showDate />} />                   
                        <div className='flex flex-row gap-8 justify-center'>
                          {[
                            { label: "Opened", name: "openedPerc" },
                            { label: "Success", name: "alertPerc" }
                          ].map(({ label, name }) => (
                            <div key={name} className='flex flex-col items-center gap-1'>
                              <ProgressCircle size="lg" perc={infoDialog.row.original[name] ?? 0} />
                              <span className='text-muted-foreground font-bold text-sm'>{label}</span>
                            </div>
                          ))}                 
                        </div>
                      </div>                    
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={60}>
                    <ChatboxEach info={infoDialog} />  
                  </ResizablePanel>
                </ResizablePanelGroup>                  
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  )
}