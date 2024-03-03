import { useMemo } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { columns, initialVisibilty } from './-columns';
import SheetActions from '@/components/SheetActions';
import DataTableSS from '@/components/DataTableSS';
import negotiatorsQueryOptions from '@/api/negotiatorsQueryOptions';
import useSheetState from '../-components/hooks/use-sheetState';
import useTableState from '../-components/hooks/use-tableState';
import { get } from 'lodash';

export const Route = createLazyFileRoute('/crm/dashboard/each')({
    component: indexComponent
})

function indexComponent() {
  
  const { showSheet, sheetProps } = useSheetState()

  const search = Route.useSearch()

  const { queryOptions, tableProps } = useTableState({ search, queryOptionsFn: negotiatorsQueryOptions })

  const defaultColumnVisibility = useMemo(() => (
    Object.fromEntries(
      columns.map(({ id, ...rest }) => ([id, get(rest, 'meta.defaultVisibilty', true)]))
    )
  ), [columns])

  const meta = useMemo(() => ({ 
    currentQueryOptions: queryOptions,
    showSheet
  }), [queryOptions.queryKey])

  return (
    <>
      <DataTableSS 
        tableName="dashboard"
        columns={columns}
        defaultColumnVisibility={defaultColumnVisibility} 
        meta={meta}
        {...tableProps}
      />
      {sheetProps.info && (
        <SheetActions {...sheetProps} />
      )}
    </>
  )
}