import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Cross2Icon, EnvelopeClosedIcon, ExternalLinkIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PhoneCallIcon, User, User2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useMap } from '@uidotdev/usehooks';
import _ from 'lodash';
import useTableModel from '@/hooks/use-TableModel';
import { fetchSelectedDataQueryOptions } from '@/services/fourProp';
import numberWithCommas from '@/utils/numberWithCommas';
import { Button } from '@/components/ui/button';
import DataTableFacetedFilter from '@/components/dataTableFacetedFilter';
import DataTableDnd from '@/components/DataTableDnd';
import DataTablePagination from '@/components/DataTablePagination';
import { Badge } from '@/components/ui/badge';
import useDialogModel from '@/hooks/use-DialogModel';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import DataTableViewOptions from '@/components/DataTableViewOptions';
import { useSelectionControl, useSendBizchatDialog } from '@/components/CRMTable/hooks';
import { SelectionControl, SendBizchatDialog } from '@/components/CRMTable/components';
import TableDialog from './components/TableDialog';
import { FOURPROP_BASEURL } from '@/services/fourPropClient';

const defaultDialogTabs = [
    { icon: <User2 className='size-4' />, name: 'Info', id: 'info' }
]

export default function CRMTable ({ 
  tableName, 
  dialogTabs = defaultDialogTabs,
  defaultDialogActiveTab = defaultDialogTabs[0],
  tableVersion,
  facets, 
  services, 
  navigate, 
  defaultTableModelState, 
  columns, 
  authUserId,
  userCardComponent,
  enableHoverCard,
  tableDialogRenderMessages,
  tableDialogMetricsComponent,
  eachEmailCompaignsLink,
  enableMassBizchat
}) {
  
  const dataPool = useMap()

  const makeFetchNegQueryOptions = useCallback(selected => 
    fetchSelectedDataQueryOptions(dataPool, selected, services.selectedDataPool),
    []
  )

  const dialogModel = useDialogModel()
  
  const tableModel = useTableModel({ defaultState: defaultTableModelState })

  const tableQueryOptions = useTableModel.use.tableQueryOptions({ 
    tableName, 
    tableVersion, 
    services, 
    staleTime: 60_000,
    tableModel
  })
  
  const tableSSModal = useTableModel.use.tableSS({ 
    tableName, 
    tableVersion,
    authUserId,
    tableQueryOptions, 
    columns, 
    dataPool,
    components: {
      UserCard: userCardComponent,
      enableHoverCard
    },
    dialogModel,
    tableModel
  })

  const facetsModal = useTableModel.use.facets({
    tableName, 
    facets,
    services,
    tableSSModal
  })

  const tableDialogModal = useTableModel.use.tableDialog({
    tableSSModal,
    dialogTabs,
    defaultDialogActiveTab,
    facetsModal,
    renderMessages: tableDialogRenderMessages,
    metricsComponent: tableDialogMetricsComponent,
    tableQueryOptions,
    services
  })

  const selectionControl = useSelectionControl({ 
    navigate,
    tableSSModal, 
    makeFetchNegQueryOptions
  })

  const sendBizchatDialog = useSendBizchatDialog({ 
    from: authUserId,
    services,
    selectionControlModal: selectionControl,
    makeFetchNegQueryOptions
  })

  const { table } = tableSSModal

  return (
    <>
      <div className='grid grid-rows-[4rem_1fr_4rem] h-full'>
        <div className='flex flex-row items-center gap-3 overflow-auto'>
          <div className='flex gap-4 w-1/3'>
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
                    {enableMassBizchat && (
                      <SendBizchatDialog.Button 
                        selected={selectionControl.selected}
                        model={sendBizchatDialog} 
                      />
                    )}
                  </SelectionControl.Footer>
                </SelectionControl.Content>
              </Popover>
            )}
            {enableMassBizchat && <SendBizchatDialog.ButtonSm model={sendBizchatDialog} />}
          </div>
          <div className='flex flex-grow items-center justify-center gap-4 w-1/3'>
            <GlobalFilter 
              table={table} 
              globalFilter={tableModel.tableState.globalFilter}  
            />
            <FacetFilters modal={facetsModal} />
            {tableModel.isDirtyFilters && (
              <Button 
                variant="link"
                className="p-0 h-8 w-8 flex items-center hover:scale-110 opacity-50 hover:opacity-100 transition-all"
                onClick={tableModel.onClearAllFilters}
              >
                <Cross2Icon />
              </Button>
            )}
            {eachEmailCompaignsLink && (
              <Button size="xs" variant="ghost" asChild>
                <a href={`${FOURPROP_BASEURL}/marketing-campaigns/campaigns`} target='__blank' className='space-x-2'>
                  <span>Mailshot</span> <ExternalLinkIcon className='w-3' />
                </a>
              </Button>
            )}
          </div>
          <div className='flex w-1/3 justify-end'>
            <DataTableViewOptions table={table} />
          </div>
        </div>
        <DataTableDnd 
          table={table} 
          containerClassName="border border-sky-200 rounded-lg shadow-sm bg-white"
        />
        <DataTablePagination table={table} />
      </div>
      <TableDialog model={tableDialogModal} />
      {enableMassBizchat && (
        <SendBizchatDialog 
          model={sendBizchatDialog} 
          tableSSModal={tableSSModal}
          selected={selectionControl.selected} 
        />
      )}
    </>
  )
}

function FacetFilters ({ modal }) {
  return (
    <Suspense fallback={<p className='opacity-50 text-sm p-3'>Loading...</p>}>
      {modal.filters.map(({ columnId, column, title, disableFacets, facetQueryOptions }) => {
        return (
          <FacetFilter
            key={columnId}
            title={title}
            column={column}
            disableFacets={disableFacets}
            facetQueryOptions={facetQueryOptions}
          />
        )
      })}
    </Suspense>
  )
}

function FacetFilter ({ title, column, disableFacets, facetQueryOptions }) {
  const { data } = useSuspenseQuery(facetQueryOptions)

  return (
    <DataTableFacetedFilter
      title={title}
      column={column}
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