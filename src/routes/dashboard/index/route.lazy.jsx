import { useMemo } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { columns, initialVisibilty } from './-data-table-columns';
import SheetActions from '@/components/SheetActions';
import DataTableSS from '@/components/DataTableSS';
import negotiatorsQueryOptions from '@/api/negotiatorsQueryOptions';
import useSheetState from '../-hooks/use-sheetState';
import useTableState from '../-hooks/use-tableState';
import clientsPaginQueryOptions from '@/api/clientsPaginQueryOptions';

export const Route = createLazyFileRoute('/dashboard/')({
    component: indexComponent
})

function indexComponent() {
  
  const { showSheet, sheetProps } = useSheetState()

  const search = Route.useSearch()

  //negotiatorsQueryOptions
  const { queryOptions, tableProps } = useTableState({ search, queryOptionsFn: clientsPaginQueryOptions })

  const meta = useMemo(() => ({ 
    currentQueryOptions: queryOptions,
    showSheet
  }), [queryOptions.queryKey])

  return (
    <>
      <DataTableSS 
        tableName="dashboard"
        columns={columns}
        initialVisibilty={initialVisibilty} 
        meta={meta}
        {...tableProps}
      />
      {sheetProps.info && (
        <SheetActions {...sheetProps} />
      )}
    </>
  )
}