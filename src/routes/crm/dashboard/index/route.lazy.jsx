import { useCallback, useReducer, useState } from 'react';
import { createLazyFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import DataTable from '@/components/DataTable';
import { columns, initialVisibilty } from './-data-table-columns';
import SheetActions from '@/components/SheetActions';
import { useSuspenseQuery } from '@tanstack/react-query';
import clientsQueryOptions from '@/api/clientsQueryOptions';
import categoriesQueryOptions from '@/api/categoriesQueryOptions';
import DataTableSS from '@/components/DataTableSS';
import clientsPaginQueryOptions from '@/api/clientsPaginQueryOptions';
import { useListStore } from '@/store';

export const Route = createLazyFileRoute('/crm/dashboard/')({
    component: indexComponent
})

const initialState = { info: null, tab: 'view', open: false }

const reducer = (state, action) => {
  switch (action.type) {
    case 'open':  
      return {
        ...state,
        open: action.payload
      }
    case 'tab':
      return {
        ...state,
        tab: action.payload 
      }
    case 'info': 
      return {
        ...state,
        info: action.payload 
      }
    case 'show':
      return {
        ...state,
        tab: action.payload.tab ?? initialState.tab,
        info: action.payload.info,
        open: true
      }
    case 'hideDialog':
      return initialState
    default:
      throw new Error('invalid action')
  }
}

function indexComponent() {

  const navigate = useNavigate()

  const { data: categories } = useSuspenseQuery(categoriesQueryOptions)

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [columnFilters, setColumnFilters] = useState([])

  const sorting = useListStore.use.sorting()
  const setSorting = useListStore.use.setSorting()

  const queryOptions = clientsPaginQueryOptions({ 
    pagination,
    sorting,
    columnFilters
  })

  const { data } = useSuspenseQuery(queryOptions)

  const [{ count }, data_] = data

  const [sheetState, sheetDispatch] = useReducer(reducer, initialState)

  const changePage = ({ pageIndex, pageSize }) => {
    setPagination({ pageIndex, pageSize })
    navigate({ search: (prev) => ({ ...prev, page: pageIndex + 1, perPage: pageSize }) })
  }

  const changePageIndex = (pageIndex) => {
    changePage({ ...pagination, pageIndex })
  }

  const handlePageChange = (newPageFn) => {
    const newPage = newPageFn(pagination)
    changePage(newPage)
  }

  const handleColumnFiltersChange = (newFilters) => {
    setColumnFilters(newFilters)
    changePage(1)
  }

  const handleSortChange = (newSorting) => {
    setSorting(newSorting)
    changePage(1)
  }

  const handleShowSheet = (info, tab) => {
    sheetDispatch({ type: 'show', payload: { info, tab } })
  }

  const handleOpenChange = (open) => {
    sheetDispatch({ type: 'open', payload: open })
  }

  const handleTabValueChange = (tab) => {
    sheetDispatch({ type: 'tab', payload: tab })
  }

  return (
    <>
      <DataTableSS 
        tableName="mainDataTable"
        initialVisibilty={initialVisibilty} 
        pageCount={Math.round(count / pagination.pageSize)}
        columns={columns} 
        data={data_} 
        sorting={sorting}
        pagination={pagination}
        columnFilters={columnFilters}
        onColumnFiltersChange={handleColumnFiltersChange}
        onSortingChange={handleSortChange}
        onPaginationChange={handlePageChange}
        meta={{ showSheet: handleShowSheet, categories, clientQueryKey: queryOptions.queryKey }}
      />
      {/* <DataTable 
        tableName="mainDataTable"
        columns={columns} 
        data={data} 
        initialVisibilty={initialVisibilty} 
        meta={{ showSheet: handleShowSheet, categories }}
      /> */}
      {sheetState.info && (
        <SheetActions 
          {...sheetState}
          onOpenChange={handleOpenChange} 
          onTabValueChange={handleTabValueChange} 
        />
      )}
    </>
  )
}