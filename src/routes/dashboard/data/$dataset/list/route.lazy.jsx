import { createLazyFileRoute } from '@tanstack/react-router'
import useTableState from '../../../-hooks/use-tableState';
import SheetActions from '@/components/SheetActions';
import LinkGroup from '../../../-components/LinkGroup';
import useSheetState from '@/routes/dashboard/-hooks/use-sheetState';
import { useMemo } from 'react';
import DataTableSS from '@/components/DataTableSS';

export const Route = createLazyFileRoute('/dashboard/data/$dataset/list')({
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
      <div className='overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-xl p-8'>
        <DataTableSS 
          tableName={`d.v1.${cx.queryOptions.queryKey[0]}`}
          meta={meta}
          {...tableProps}
        />
        {sheetProps.info && (
          <SheetActions {...sheetProps}/>
        )}
      </div>
    </>
  )
}