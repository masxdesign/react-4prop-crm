import { createLazyFileRoute } from '@tanstack/react-router'
import useTableState from '../../../../../hooks/use-tableState';
import useSheetState from '@/hooks/use-sheetState';
import { Suspense, forwardRef, useMemo } from 'react';
import DataTableSS from '@/components/DataTableSS';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProgressCircle from '@/routes/dashboard/-ui/ProgressCircle';
import AlertEmailClick from '@/routes/dashboard/-ui/AlertEmailClick';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatboxEach from './-ui/ChatboxEach';
import { fetchNotes } from '@/api/fourProp';
import { useSuspenseQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { CaretSortIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { PhoneCallIcon } from 'lucide-react';
import { findLast, isEmpty } from 'lodash';
import ColumnNextContactEach from './-ui/ColumnNextContactEach';
import ColumnLastContactEach from './-ui/ColumnLastContactEach';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/components/Auth/Auth-context';

const Dd = forwardRef(({ bold, label, value, className, labelClassName = 'min-w-[90px] max-w-[120px]', collapsible, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-row items-center gap-4', className)} {...props}>
    <div className={cn('basis-1/5 text-muted-foreground', labelClassName)}>{label}</div>
    <div className={cn('basis-4/5 truncate', { 'font-bold': bold, 'hover:underline cursor-pointer': collapsible })}>
      {collapsible ? (
        <div className='flex flex-row gap-4 items-center'>
          {value}
          <CaretSortIcon className="h-4 w-4" />
        </div>
      ) : (
        <>
          {value}
        </>
      )}
    </div>
  </div>
))

const DD = forwardRef(({ label, row, name, bold, labelClassName, alwaysShow, collapsible, ...props }, ref) => {
  const value = row[name]

  if(!alwaysShow && isEmpty(value)) return null

  return (
    <Dd 
      ref={ref}
      bold={bold}
      label={label}
      labelClassName={labelClassName}
      collapsible={collapsible}
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
      {...props}
    />
  )
})

export const Route = createLazyFileRoute('/dashboard/data/each/list')({
    component: ClientsListComponent
})

function ClientsListComponent() {
  const { tableName, queryOptions, columns, auth } = Route.useRouteContext()
  
  const tableProps = useTableState({ queryOptions })

  const [infoDialog, dialog, showDialog] = useSheetState()

  const meta = useMemo(() => ({ 
    dataQueryKey: queryOptions.queryKey,
    showDialog,
    hoverCardComponent: TableHoverCard
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
          <DialogEach 
            info={infoDialog} 
            user={auth.user}
            {...dialog} 
          />
        )}
      </div>
    </>
  )
}

function DialogEach ({ info, user, ...props }) {
  const { id } = info.row.original

  const chatboxQueryOptions = {
    queryKey: ['chatboxEach', id],
    queryFn: () => fetchNotes({ id })
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">                
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[200px]"
          >
            <ResizablePanel defaultSize={40} minSize={30} maxSize={50} className='p-4 space-y-4'>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {info.row.getValue('fullName')}
                </DialogTitle>
              </DialogHeader>
              <DialogMetricsEach chatboxQueryOptions={chatboxQueryOptions} info={info} />              
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <ChatboxEach 
                queryOptions={chatboxQueryOptions} 
                info={info} 
                user={user}
              />  
            </ResizablePanel>
          </ResizablePanelGroup>                  
      </DialogContent>
    </Dialog>
  )
}

function TableHoverCard ({ cell }) {
  const { first, last, company, ...row } = cell.row.original

  return (
    <div className='text-sm space-y-2'>
      <div>
        <b>{first} {last}</b>
        <div className='text-nowrap truncate text-muted-foreground'>{company}</div>
      </div>
      {[
        { label: <EnvelopeClosedIcon className="w-4 h-4" />, name: "email" },
        { label: <PhoneCallIcon className="w-4 h-4" /> , name: "phone" },
      ].map((props) => (
        <DD key={props.name} row={row} labelClassName="max-w-[10px]" {...props} />
      ))}
    </div>
  )
}

function DialogMetricsEach ({ chatboxQueryOptions, info }) {

  return (
    <div className='text-sm space-y-2'>
      {[
        { label: "Email", name: "email" },
        { label: "Phone", name: "phone" },
      ].map((props) => (
        <DD key={props.name} row={info.row.original} {...props} />
      ))}
      {[
        { label: "Company", name: "company", bold: true },
        { label: "Website", name: "website" },
        { label: "City", name: "city" },
        { label: "Postcode", name: "postcode" }
      ].map((props) => (
        <DD key={props.name} row={info.row.original} {...props} />
      ))}
      <div className='h-3'/>
      <Suspense fallback={<p>Loading...</p>}>
        <DialogBranchEach chatboxQueryOptions={chatboxQueryOptions} />
      </Suspense>
      <div className='h-3' />
      {[
        { label: "Next contact", value: <ColumnNextContactEach info={info} /> },
        { label: "Last contact", value: <ColumnLastContactEach info={info} /> },
      ].map((props) => (
        <Dd key={props.label} labelClassName="min-w-[90px]" {...props} />
      ))}
      <Suspense fallback={<p>Loading...</p>}>
        <DialogBizchatEach chatboxQueryOptions={chatboxQueryOptions} label="Bizchat" />
      </Suspense>
      <div className='h-12' />
      <div className='flex flex-col gap-4'>
        <Dd label="Alert" value={<AlertEmailClick info={info} showDate />} />                   
        <div className='flex flex-row gap-8 justify-center'>
          {[
            { label: "Opened", name: "openedPerc" },
            { label: "Success", name: "alertPerc" }
          ].map(({ label, name }) => (
            <div key={name} className='flex flex-col items-center gap-1'>
              <ProgressCircle size="lg" perc={info.row.original[name] ?? 0} />
              <span className='text-muted-foreground font-bold text-sm'>{label}</span>
            </div>
          ))}                 
        </div>
      </div>                    
    </div>
  )
}

function DialogBizchatEach ({ chatboxQueryOptions, label }) {
  const { user } = useAuth()
  const { data } = useSuspenseQuery(chatboxQueryOptions)

  const [messages, branch] = data

  const bizMessage = useMemo(() => {

    const message = findLast(messages, ({ resource_name }) => resource_name.includes(':bz'))

    if(message) {

      return {
        link: (
          <a 
            href={`/bizchat/rooms/${message.i}?i=${user.bz_hash}`}
            className='text-sky-700 hover:underline inline-flex bg-sky-50 items-center justify-center text-xs h-7 px-2.5 py-0.5 rounded-md'
            target='__blank'
          >
            Open chat
          </a>
        )
      }
    }

  }, [messages])

  if(!bizMessage) return null

  return (
    <DD row={bizMessage} label={label} name="link" />
  )
}

function DialogBranchEach ({ chatboxQueryOptions }) {

  const { data } = useSuspenseQuery(chatboxQueryOptions)

  const [_, branch] = data

  return (
    <Collapsible className='space-y-2'>
      <CollapsibleTrigger asChild>
        <DD row={branch} label="Branch" name="name" bold collapsible />
      </CollapsibleTrigger>
      <CollapsibleContent className='space-y-2'>
        {[
          { label: "Phone", name: "phone" },
          { label: "Address", name: "address" },
          { label: "County", name: "county" },
          { label: "City", name: "towncity" },
          { label: "Poscode", name: "postcode" },
        ].map((props) => (
          <DD key={props.name} row={branch} {...props} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}