import { useMemo } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'
import useTableState from '../../../-ui/use-tableState';
import SheetActions from '@/components/SheetActions';
import useSheetState from '@/routes/dashboard/-ui/use-sheetState';
import DataTableSS from '@/components/DataTableSS';

export const Route = createLazyFileRoute('/dashboard/data/each/list')({
    component: DatasetComponent
})

function DatasetComponent() {

  const cx = Route.useRouteContext()
  
  const { showSheet, sheetProps } = useSheetState({ props: cx.sheetProps })

  const tableProps = useTableState({ queryOptions: cx.queryOptions, props: cx.tableProps })

  const meta = useMemo(() => ({ 
    dataQueryKey: cx.queryOptions.queryKey,
    showSheet
  }), [cx.queryOptions.queryKey])

  return (
    <>
      <div className='overflow-hidden p-4'>
        <DataTableSS 
          tableName={`d.v1.${cx.queryOptions.queryKey[0]}`}
          meta={meta}
          {...tableProps}
        />
        {sheetProps.info && (
          <SheetActions 
            {...sheetProps}
          />
        )}
      </div>
    </>
  )
}