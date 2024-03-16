import DataTablePagination from '../DataTablePagination'
import DataTableDnd from '../DataTableDnd'

/** delete */

const DataTableSS = ({ table }) => {
    return (
        <div className='space-y-4'>
            <div className='rounded-md border'>
                <DataTableDnd table={table} />
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}

export default DataTableSS