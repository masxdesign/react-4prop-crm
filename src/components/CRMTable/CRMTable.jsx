import React, { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon, DotsHorizontalIcon, EnvelopeClosedIcon, ExternalLinkIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { PhoneCallIcon, User } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import { cx } from 'class-variance-authority';
import { useMap } from '@uidotdev/usehooks';
import { useNavigate } from '@tanstack/react-router';
import _, { isEmpty } from 'lodash';
import useTableModel from '@/hooks/use-TableModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { fetchFacets, fetchNegotiatorByNids, fetchNegotiators, fetchNotes, fetchSelectedDataQueryOptions, fetchSelectedNegotiatorsDataQueryOptions, FOURPROP_BASEURL } from '@/api/fourProp';
import { cn } from '@/lib/utils';
import numberWithCommas from '@/utils/numberWithCommas';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/components/Auth/Auth-context';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import DataTableFacetedFilter from '@/components/dataTableFacetedFilter';
import DataTableDnd from '@/components/DataTableDnd';
import DataTablePagination from '@/components/DataTablePagination';
import { Badge } from '@/components/ui/badge';
import useDialogModel from '@/hooks/use-DialogModel';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import DataTableViewOptions from '@/components/DataTableViewOptions';
import ProgressCircle from '@/components/ProgressCircle';
import { Ddd, Dd, Dddl, Ddl } from '@/components/DisplayData/components'
import { useSelectionControl, useSendBizchatDialog } from '@/components/CRMTable/hooks';
import { SelectionControl, SendBizchatDialog, UserCard, AlertEmailClick, ColumnNextContactEach, LastContact } from '@/components/CRMTable/components';
import { COMPANY_TYPE_NAMES } from '@/constants';
import Chatbox from './components/Chatbox';

export default function CRMTable ({ 
  tableName, 
  tableDialogRenderMessages, 
  facets, 
  services, 
  navigate, 
  defaultTableModelState, 
  columns, 
  authUserId,
  userCardComponent
}) {
  
  const dataPool = useMap()

  const makeFetchNegQueryOptions = useCallback(selected => 
    fetchSelectedDataQueryOptions(dataPool, selected, services.selectedDataPool),
    []
  )

  const dialogModel = useDialogModel()
  
  const tableModel = useTableModel({ defaultState: defaultTableModelState })
  
  const tableSSModal = useTableModel.use.tableSS({ 
    tableName, 
    authUserId,
    queryFn: services.tableSSList, 
    columns, 
    dataPool,
    components: {
      TableHoverCard,
      UserCard: userCardComponent
    },
    dialogModel,
    tableModel
  })

  const tableDialogModal = useTableModel.use.tableDialog({
    tableSSModal,
    renderMessages: tableDialogRenderMessages,
    services: services.tableDialog
  })

  const selectionControl = useSelectionControl({ 
    navigate,
    tableSSModal, 
    makeFetchNegQueryOptions
  })

  const sendBizchatDialog = useSendBizchatDialog({ 
    from: authUserId,
    services: services.massBizchat,
    selectionControlModal: selectionControl,
    makeFetchNegQueryOptions
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
                    <SelectionControl.HeaderAndContent 
                      modal={selectionControl} 
                    />
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
          <div className='flex flex-grow items-center justify-center gap-4'>
            <GlobalFilter 
              table={table} 
              globalFilter={tableModel.tableState.globalFilter}  
            />
            {facets.map(props => (
              <FacetedFilter 
                key={props.columnId}
                tableName={tableName}
                columnId={props.columnId}
                disableFacets={tableModel.isDirtyFilters}
                onFacetFilterRequest={services.facetList}
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
            <Button size="xs" variant="ghost" asChild>
              <a href={`${FOURPROP_BASEURL}/marketing-campaigns/campaigns`} target='__blank' className='space-x-2'>
                <span>Mailshot</span> <ExternalLinkIcon className='w-3' />
              </a>
            </Button>
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
      />
      <TableDialog model={tableDialogModal} />
    </>
  )
}

function TableDialog ({ model, ...props }) {
  return (
    <Dialog open={model.dialogModel.state.open} onOpenChange={model.dialogModel.onOpenChange} {...props}>
      <DialogContent className="transition-all sm:max-w-[900px] min-h-[600px] p-0 overflow-hidden">
        {model.id ? (
          <TableDialogContentRenderer model={model} />
        ) : (
          <p>Loading...</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TableDialogContentRenderer ({ model }) {
  const resultFromTable = useTableModel.use.getResultFromTable(model)

  return resultFromTable ? (
    <TableDialogContent 
      info={resultFromTable.row.original} 
      fromTable={resultFromTable}
      model={model}
    /> 
  ) : (
    <Suspense
      fallback={
        <p className='inset-0 absolute flex items-center justify-center text-lg opacity-40 font-bold'>
          Loading...
        </p>
      }
    >
      <TableDialogContentFetcher model={model} />   
    </Suspense>
  )
}

function TableDialogContentFetcher ({ model }) {
  const { data } = useSuspenseQuery(model.infoQueryOptions)

  return (
    <TableDialogContent 
      info={data} 
      model={model}
    />
  )
}

function TableDialogContent ({ info, model, fromTable = null }) {
  const { 
    authUserId, 
    chatboxQueryOptions, 
    renderMessages, 
    addMutationOptions, 
    deleteMutationOptions 
  } = model

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
            <TableDialogMetrics 
              info={info} 
              model={model}
            />              
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            {authUserId === info.id ? (
              <div className='h-full bg-slate-100'>
                <div className='uppercase opacity-50 font-bold text-sm text-slate-400 w-full h-full flex justify-center items-center'>
                  You
                </div>
              </div>
            ) : (
              <Chatbox 
                chatboxQueryOptions={chatboxQueryOptions} 
                addMutationOptions={addMutationOptions}
                deleteMutationOptions={deleteMutationOptions}
                renderMessages={renderMessages}
                enableDelete={false}
              /> 
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      }
    />
  )
}

function TableHoverCard ({ cell, hideView }) {
  const info = cell.table ? cell : cell.getContext()
  const { dialogModel, components } = info.table.options.meta

  const handleShowDialog = ({ id }) => {
    dialogModel.showDialog(id)
  }

  return (
    <components.UserCard 
      data={cell.row.original}
      onView={handleShowDialog}
      hideView={hideView}
    />
  )
}

function TableDialogMetrics ({ info, model }) {
  
  return (
    <div className='text-sm space-y-2'>
      <Dddl  
        items={[
          { label: "Email", name: "email" },
          { label: "Company", name: "company", bold: true },
          { label: "Co. type", name: "type", names: COMPANY_TYPE_NAMES },
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
        <DialogBranchEach chatboxQueryOptions={model.chatboxQueryOptions} />
      </Suspense>
      {model.authUserId !== info.id && (
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
                  />
                ) 
              },
              { 
                label: "Last contact", 
                value: (
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
        <TableDialogChatLinks chatboxQueryOptions={model.chatboxQueryOptions} />
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

function TableDialogChatLinks ({ chatboxQueryOptions }) {
  const { user } = useAuth()
  const { data } = useSuspenseQuery(chatboxQueryOptions)

  const [_, __, ___, lastMessage, mailshots] = data

  return (
    <div className='space-y-3'>
      {lastMessage && (
        <Ddd row={{
          link: (
            <a 
              href={`/bizchat/rooms/${lastMessage.chat_id}?i=${user.bz_hash}`}
              className='text-sky-700 hover:underline inline-flex bg-sky-50 items-center justify-center text-xs h-7 px-2.5 py-0.5 rounded-md'
              target='__blank'
            >
              View all messages
            </a>
          )
        }} label="Bizchat" name="link" />
      )}
      {mailshots.length > 0 && (
        <Ddl 
          items={[
            {
              label: "Last mailshot",
              value: [mailshots[0]].map(item => (
                <Button key={item.id} variant="link" size="xs" asChild>
                  <a href={item.link} target='__blank' className='text-orange-500 bg-orange-50'>{item.template_name}</a>
                </Button>
              )),
              disableTruncate: true
            }
          ]}
        />
      )}
    </div>
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
            { label: "Phone", name: "phone" },
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
  
  const { dialogModel, components } = info.table.options.meta
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
    dialogModel.showDialog(info.row.original.id)
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
                onClick={() => dialogModel.showDialog(info.row.original.id)}
                disabled={!info}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          {info && (
            <HoverCardPortal container={document.body}>
                <HoverCardContent className="w-[300px]">
                  <components.TableHoverCard cell={info} hideView />
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

function FacetedFilter ({ tableName, table, title, columnId, disableFacets, names, onFacetFilterRequest }) {
  const { data } = useSuspenseQuery({
    queryKey: [tableName, 'facetFilter', columnId],
    queryFn: () => onFacetFilterRequest(columnId),
    select: data => {

      let data_ = data.split('`').map((item) => item.split('^'))

      let options = []
      let facets = new Map

      for(const [label, count] of data_) {
          const label_ = names?.[label] ?? label
          options.push({ label: label_, value: label })
          facets.set(label, count > 999 ? numberWithCommas(count): count)
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

function CSSOnMount ({ render }) {
  const [isMount, setIsMount] = useState(false)

  useEffect(() => {
    setIsMount(true)
  }, [])

  return render(isMount)
}