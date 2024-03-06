import { useMemo } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'
import DataTableSS from '@/components/DataTableSS';
import useSheetState from '../../-hooks/use-sheetState';
import useTableState from '../../-hooks/use-tableState';
import SheetActions from '@/components/SheetActions';
import { columns } from './-columns';

export const Route = createLazyFileRoute('/crm/dashboard/list/$dataset')({
    component: DatasetComponent
})

function DatasetComponent() {

  const { dataset } = Route.useParams()
  
  const { showSheet, sheetProps } = useSheetState()

  const { queryOptions, tableProps } = useTableState({ dataset })

  const meta = useMemo(() => ({ 
    currentQueryOptions: queryOptions,
    showSheet
  }), [queryOptions.queryKey])

  return (
    <>
      <DataTableSS 
        tableName="dashboard"
        columns={columns}
        meta={meta}
        {...tableProps}
      />
      {sheetProps.info && (
        <SheetActions {...sheetProps} />
      )}
    </>
  )
}