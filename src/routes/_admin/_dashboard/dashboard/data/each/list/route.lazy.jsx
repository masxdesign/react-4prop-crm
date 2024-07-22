import React, { Suspense, forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import useTableModel from '@/hooks/use-TableModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatboxEach from './-ui/ChatboxEach';
import { fetchFacets, fetchNegotiators, fetchNotes } from '@/api/fourProp';
import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { CaretSortIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, Cross2Icon, DotsHorizontalIcon, EnvelopeClosedIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { PhoneCallIcon, User } from 'lucide-react';
import { findLast, isEmpty } from 'lodash';
import ColumnNextContactEach from './-ui/ColumnNextContactEach';
import ColumnLastContactEach from './-ui/ColumnLastContactEach';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/components/Auth/Auth-context';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import DataTableFacetedFilter from '@/components/dataTableFacetedFilter';
import DataTableDnd from '@/components/DataTableDnd';
import DataTablePagination from '@/components/DataTablePagination';
import { Badge } from '@/components/ui/badge';
import useDialogModel from '@/hooks/use-DialogModel';
import Ddd from './-ui/Ddd';
import Dd from './-ui/Dd';
import Dddl from './-ui/Dddl';
import Ddl from './-ui/Ddl';
import SelectionControl from './-ui/SelectionControl';
import useSelectionControl from './-ui/use-SelectionControl';
import { useNavigate } from '@tanstack/react-router';
import SendBizchatDialog from './-ui/SendBizchatDialog';
import useSendBizchatDialog from './-ui/use-SendBizchatDialog';
import UserCard from './-ui/UserCard';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Controller, useForm } from 'react-hook-form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import numberWithCommas from '@/utils/numberWithCommas';
import DataTableViewOptions from '@/components/DataTableViewOptions';
import ProgressCircle from '@/routes/-ui/ProgressCircle';
import AlertEmailClick from '@/routes/-ui/AlertEmailClick';
import { cx } from 'class-variance-authority';
import { useMap } from '@uidotdev/usehooks';
import useMakeFetchNegotiatorsDataQueryOptions from './-ui/use-makeFetchNegotiatorsDataQueryOptions';
import LastContact from '@/routes/-ui/LastContact';

export const Route = createLazyFileRoute('/_admin/_dashboard/dashboard/data/each/list')({
    component: ClientsListComponent
})

function ClientsListComponent() {
  const { tableName, defaultTableModelState, columns, auth } = Route.useRouteContext()
  
  const dataPool = useMap()

  const makeFetchNegQueryOptions = useMakeFetchNegotiatorsDataQueryOptions({ dataPool })

  const dialogModel = useDialogModel()
  
  const tableModel = useTableModel({ defaultState: defaultTableModelState })
  
  const tableSSModal = useTableModel.use.tableSS({ 
    dataPool,
    tableName, 
    queryFn: (variables) => fetchNegotiators(variables, auth), 
    columns, 
    meta: {
      showDialog: dialogModel.showDialog,
      hoverCardComponent: TableHoverCard,
      auth
    },
    tableModel
  })
  
  const navigate = useNavigate({ from: "/dashboard/data/each/list" })

  const selectionControl = useSelectionControl({ 
    tableSSModal, 
    makeFetchNegQueryOptions,
    navigate 
  })

  const sendBizchatDialog = useSendBizchatDialog({ 
    auth,
    selectionControlModal: selectionControl
  })

  const { table } = tableSSModal

  return (
    <>
      <div className='overflow-hidden p-4 space-y-4'>
        <div className='flex flex-row gap-3'>
          <div className='flex gap-4 w-64'>
            <Badge variant="secondary">{tableSSModal.countFormatted}</Badge>
            {tableSSModal.selected.length > 0 && (
              <Popover 
                open={selectionControl.open} 
                onOpenChange={selectionControl.onOpenChange}
              >
                <PopoverTrigger asChild>
                  <Button variant="secondary" className="h-8">
                      {selectionControl.selected.length} selected
                  </Button>
                </PopoverTrigger>
                <SelectionControl.Content>
                  <Suspense 
                    fallback={
                      <p className='p-4 text-lg opacity-40 font-bold'>
                        Loading...
                      </p>
                    }
                  >
                    <SelectionControl.HeaderAndContent modal={selectionControl} />
                  </Suspense>
                  <SelectionControl.Footer>
                    <SendBizchatDialog.Button 
                      selected={selectionControl.selected}
                      model={sendBizchatDialog} 
                    />
                  </SelectionControl.Footer>
                </SelectionControl.Content>
              </Popover>
            )}
            <SendBizchatDialog.ButtonSm model={sendBizchatDialog} />
          </div>
          <div className='flex flex-grow justify-center gap-4'>
            <GlobalFilter 
              table={table} 
              globalFilter={tableModel.tableState.globalFilter}  
            />
            {[
              { columnId: "company", title: "Companies" },
              { columnId: "city", title: "City" },
              { columnId: "a", title: "Postcode" },
            ].map((props) => (
              <FacetedFilter 
                key={props.columnId}
                queryKey={[tableName, 'facet', props.columnId]}
                disableFacets={tableModel.isDirtyFilters}
                table={table} 
                {...props}
              />
            ))}
            {tableModel.isDirtyFilters && (
              <Button 
                variant="link"
                className="p-0 h-8 w-8 flex items-center hover:scale-110 opacity-50 hover:opacity-100 transition-all"
                onClick={tableModel.onClearAllFilters}
              >
                <Cross2Icon />
              </Button>
            )}
          </div>
          <div className='flex w-64 justify-end'>
            <DataTableViewOptions table={table} />
          </div>
        </div>
        <div className='rounded-md border'>
            <DataTableDnd table={table} />
        </div>
        <DataTablePagination table={table} />
      </div>
      <SendBizchatDialog 
        model={sendBizchatDialog} 
        tableSSModal={tableSSModal}
        selected={selectionControl.selected} 
        makeFetchNegQueryOptions={makeFetchNegQueryOptions}
      />
      <DialogEach model={dialogModel} user={auth.user} table={table} />
    </>
  )
}

function GlobalFilter ({ table, globalFilter }) {
  const form = useForm({
    values: globalFilter
  })

  return (
    <form 
      onSubmit={form.handleSubmit((data) => table.setGlobalFilter(data))} 
      className='flex flex-row items-center gap-2'
    >
      <Controller 
        name="column"
        control={form.control}
        render={({ field }) => {

          return (
            <ToggleGroup 
              variant="custom" 
              size="xs" 
              type="single" 
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <ToggleGroupItem value="fullname" aria-label="Toggle bold">
                <User className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="phone" aria-label="Toggle bold">
                <PhoneCallIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="email" aria-label="Toggle italic">
                <EnvelopeClosedIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )
        }} 
      />
      <Input 
        type="search" 
        placeholder={`Search by ${form.watch("column")}`} 
        className="h-8 w-48" 
        {...form.register('search')} 
      />
      <Button type="submit" size="xs" disabled={!form.formState.isDirty}>
        <MagnifyingGlassIcon />
      </Button>
    </form>
  )
}

function DialogEach ({ model, table, user, ...props }) {
  return (
    <Dialog open={model.state.open} onOpenChange={model.onOpenChange} {...props}>
      <DialogContent className="transition-all sm:max-w-[900px] min-h-[600px] p-0 overflow-hidden">
        {model.state.info ? (
          <DialogEachContentRenderer model={model} table={table} user={user} />
        ) : (
          <p>Loading...</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DialogEachContentRenderer ({ model, table, user }) {
  const { info: id } = model.state

  const resultFromTable = useTableModel.use.findResultFromTableById({ id, table })

  const chatboxQueryOptions = queryOptions({
    queryKey: ['chatboxEach', user.neg_id, id],
    queryFn: () => fetchNotes({ from: user.neg_id, recipient: id })
  })

  return resultFromTable ? (
    <DialogEachContent 
      info={resultFromTable.row.original} 
      fromTable={resultFromTable}
      user={user} 
      chatboxQueryOptions={chatboxQueryOptions}
    /> 
  ) : (
    <Suspense
      fallback={
        <p className='inset-0 absolute flex items-center justify-center text-lg opacity-40 font-bold'>
          Loading...
        </p>
      }
    >
      <DialogEachContentFetch
        id={id}
        user={user} 
        chatboxQueryOptions={chatboxQueryOptions} 
      />   
    </Suspense>
  )
}

function CSSOnMount ({ render }) {
  const [isMount, setIsMount] = useState(false)

  useEffect(() => {
    setIsMount(true)
  }, [])

  return render(isMount)
}

function DialogEachContent ({ info, fromTable, user, table = null, chatboxQueryOptions }) {
  return (
    <CSSOnMount
      render={isMount =>
        <ResizablePanelGroup 
          direction="horizontal" 
          className={cx("transition-opacity ease-in duration-700", isMount ? "opacity-100": "opacity-0")}
        >
          <ResizablePanel defaultSize={40} minSize={30} maxSize={50} className='p-4 space-y-4'>
            <DialogHeader>
              <DialogTitle className="flex flex-row justify-between items-center capitalize">
                <span>{`${info.first} ${info.last}`}</span>
                {fromTable && <DialogNavigation info={fromTable} />}
              </DialogTitle>
            </DialogHeader>
            <DialogMetricsEach 
              chatboxQueryOptions={chatboxQueryOptions} 
              info={info} 
              table={table}
              user={user}
            />              
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            {user.neg_id === info.id ? (
              <div className='h-full bg-slate-100'>
                <div className='uppercase opacity-50 font-bold text-sm text-slate-400 w-full h-full flex justify-center items-center'>
                  You
                </div>
              </div>
            ) : (
              <ChatboxEach 
                queryOptions={chatboxQueryOptions} 
                id={info.id} 
                user={user}
              /> 
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      }
    />
  )
}

function DialogEachContentFetch ({ id, user, chatboxQueryOptions }) {
  const { data } = useSuspenseQuery(useTableModel.use.fetchResultByIdQueryOption(id))

  return (
    <DialogEachContent 
      info={data} 
      user={user} 
      chatboxQueryOptions={chatboxQueryOptions} 
    />
  )
}

function TableHoverCard ({ cell, hideView }) {
  const info = cell.table ? cell : cell.getContext()

  const handleShowDialog = ({ id }) => {
    info.table.options.meta.showDialog(id)
  }

  return (
    <UserCard 
      data={cell.row.original}
      onView={handleShowDialog}
      hideView={hideView}
    />
  )
}

function DialogMetricsEach ({ chatboxQueryOptions, user, info, table = null }) {
  
  return (
    <div className='text-sm space-y-2'>
      <Dddl  
        items={[
          { label: "Email", name: "email" },
          { label: "Company", name: "company", bold: true },
          { label: "Department", name: "department" },
          { label: "Position", name: "position", alwaysShow: true },
          { label: "Website", name: "website" },
          { label: "Phone", name: "phone" },
          { label: "Mobile", name: "mobile" },
        ]}
        row={info}
      />
      <div className='h-3'/>
      <Suspense fallback={<p>Loading...</p>}>
        <DialogBranchEach chatboxQueryOptions={chatboxQueryOptions} />
      </Suspense>
      {user.neg_id !== info.id && (
        <>
          <div className='h-3' />
          <Ddl 
            items={[
              { 
                label: "Next contact",
                value: (
                  <ColumnNextContactEach 
                    id={info.id} 
                    defaultValue={info.next_contact}
                    table={table}
                    tableDataQueryKey={table?.options.meta.dataQueryKey}
                  />
                ) 
              },
              { 
                label: "Last contact", 
                value: (
                  // <ColumnLastContactEach 
                  //   id={info.id} 
                  //   defaultValue={info.last_contact}
                  //   table={table}
                  //   tableDataQueryKey={table?.options.meta.dataQueryKey}
                  // />
                  <LastContact value={info.last_contact} />
                ),
                show: !isEmpty(info.last_contact)
              },
            ]}
            labelClassName="min-w-[90px]"
          />
        </>
      )}
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
              <ProgressCircle size="lg" perc={info[name] ?? 0} />
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

  const [_, __, ___, lastMessage] = data

  const bizMessage = useMemo(() => {

    if (lastMessage) {

      return {
        link: (
          <a 
            href={`/bizchat/rooms/${lastMessage.chat_id}?i=${user.bz_hash}`}
            className='text-sky-700 hover:underline inline-flex bg-sky-50 items-center justify-center text-xs h-7 px-2.5 py-0.5 rounded-md'
            target='__blank'
          >
            View all messages
          </a>
        )
      }
    }

  }, [lastMessage?.id])

  if(!bizMessage) return null

  return (
    <Ddd row={bizMessage} label={label} name="link" />
  )
}

function DialogBranchEach ({ chatboxQueryOptions }) {

  const { data } = useSuspenseQuery(chatboxQueryOptions)

  const [_, branch] = data

  return (
    <Collapsible className='space-y-2'>
      <CollapsibleTrigger asChild>
        <Ddd row={branch} label="Branch" name="name" bold collapsible />
      </CollapsibleTrigger>
      <CollapsibleContent className='space-y-2'>
        <Dddl  
          items={[
            { label: "Address", name: "address" },
            { label: "County", name: "county" },
            { label: "City", name: "towncity" },
            { label: "Poscode", name: "postcode" },
          ]}
          row={branch}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}

function DialogNavigation ({ info }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const { showDialog } = info.table.options.meta
  const { rows } = info.table.getRowModel()

  const getInfoByIndex = useCallback((index) => {
    const visibleCells = rows[index]?.getVisibleCells()
    return visibleCells?.[0]?.getContext()
  }, [info.table.options.data])

  const getInfoByOffset = useCallback(
    (offset) => getInfoByIndex(info.row.index + offset), 
    [info.row.index, getInfoByIndex]
  )

  const nextInfo = useMemo(() => getInfoByOffset(1), [getInfoByOffset])
  const prevInfo = useMemo(() => getInfoByOffset(-1), [getInfoByOffset])

  const handleJump = (index) => {
    const info = getInfoByIndex(index)
    showDialog(info.row.original.id)
  }

  return (
    <div className='space-x-1'>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
              variant="link"
              className="h-8 w-8 p-0"
              size="sm"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DialogNavigationDropdownContent open={dropdownOpen} currentIndex={info.row.index} rows={rows} onSelect={handleJump} />
      </DropdownMenu>
      {[
        { id: 'prev', info: prevInfo, icon: ChevronLeftIcon },
        { id: 'next', info: nextInfo, icon: ChevronRightIcon }
      ].map(({ id, info, icon: Icon }) => (
        <HoverCard key={id} openDelay={1000}>
          <HoverCardTrigger asChild>
            <Button
                variant="link"
                className="h-8 w-8 p-0"
                size="sm"
                onClick={() => showDialog(info.row.original.id)}
                disabled={!info}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          {info && (
            <HoverCardPortal container={document.body}>
                <HoverCardContent className="w-[300px]">
                  <TableHoverCard cell={info} hideView />
                </HoverCardContent>
            </HoverCardPortal>
          )}
        </HoverCard>
      ))}
    </div>
  )
}

function DialogNavigationDropdownContent ({ open, currentIndex, rows, onSelect }) {
  const ref = useRef()

  const handleSelect = (e) => {
    onSelect(e.target.dataset.id)
  }

  useLayoutEffect(() => {

    if(open) {
      setTimeout(() => {
        const previous = currentIndex > 1 ? -1: 0
        ref.current?.querySelector(`.item-${currentIndex + previous}`).scrollIntoView()
      }, 1)
    }

  }, [open, currentIndex])

  return (
    <DropdownMenuContent ref={ref} align="start" className="overflow-auto h-64">
      {rows.map((row) => (
          <DropdownMenuItem 
            key={row.original.id} 
            data-id={row.original.id}
            disabled={currentIndex === row.index} 
            className={cn("flex flex-col items-start", `item-${row.index}`)}
            onSelect={handleSelect}
          >
            <span className='font-bold'>{row.getValue('fullName')}</span>
            <span className='text-muted-foreground'>{row.getValue('company')}</span>
          </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  )
}

function FacetedFilter ({ queryKey, table, title, columnId, disableFacets }) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: () => fetchFacets({ column: columnId }),
    select: data => {

      let data_ = data.split('`').map((item) => item.split('^'))

      let options = []
      let facets = new Map

      for(const [label, count] of data_) {
          options.push({ label, value: label })
          facets.set(label, count)
      }

      return { options, facets }

    }
  })

  return (
    <DataTableFacetedFilter
      column={table.getColumn(columnId)}
      title={title}
      data={data}
      disableFacets={disableFacets}
    />
  )
}