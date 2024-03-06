import { useCallback, useMemo } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'
import DataTableSS from '@/components/DataTableSS';
import useSheetState from '../../-hooks/use-sheetState';
import useTableState from '../../-hooks/use-tableState';
import SheetActions from '@/components/SheetActions';

export const Route = createLazyFileRoute('/crm/dashboard/list/$dataset')({
    component: DatasetComponent
})

function DatasetComponent() {

  const context = Route.useRouteContext()
  
  const { showSheet, sheetProps } = useSheetState()

  const tableProps = useTableState({ queryOptions: context.queryOptions })

  const meta = useMemo(() => ({ 
    dataQueryKey: context.queryOptions.queryKey,
    showSheet
  }), [context.queryOptions.queryKey])

  return (
    <>
      <DataTableSS 
        tableName="dashboard"
        columns={context.columns}
        meta={meta}
        {...tableProps}
      />
      {sheetProps.info && (
        <SheetActions {...sheetProps} />
      )}
    </>
  )
}