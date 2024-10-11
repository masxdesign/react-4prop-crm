import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Cross2Icon, EnvelopeClosedIcon, ExternalLinkIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PhoneCallIcon, User } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useMap } from '@uidotdev/usehooks';
import _ from 'lodash';
import useTableModel from '@/hooks/use-TableModel';
import { fetchSelectedDataQueryOptions, FOURPROP_BASEURL } from '@/api/fourProp';
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

export default function CRMTable ({ 
  tableName, 
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
  eachEmailCompaignsLink
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

  const tableDialogModal = useTableModel.use.tableDialog({
    tableSSModal,
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
                services={services}
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
            {eachEmailCompaignsLink && (
              <Button size="xs" variant="ghost" asChild>
                <a href={`${FOURPROP_BASEURL}/marketing-campaigns/campaigns`} target='__blank' className='space-x-2'>
                  <span>Mailshot</span> <ExternalLinkIcon className='w-3' />
                </a>
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
      />
      <TableDialog model={tableDialogModal} />
    </>
  )
}

function FacetedFilter ({ tableName, table, title, columnId, disableFacets, names, services }) {
  const { data } = useSuspenseQuery({
    queryKey: [tableName, 'facetFilter', columnId],
    queryFn: () => services.facetList(columnId),
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