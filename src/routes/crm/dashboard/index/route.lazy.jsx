import { useReducer } from 'react';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import DataTable from '@/components/DataTable';
import { columns, initialVisibilty } from './-data-table-columns';
import SheetActions from '@/components/SheetActions';
import { useSuspenseQuery } from '@tanstack/react-query';
import clientsQueryOptions from '@/api/clientsQueryOptions';
import categoriesQueryOptions from '@/api/categoriesQueryOptions';

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

  const { data: categories } = useSuspenseQuery(categoriesQueryOptions)
  const { data } = useSuspenseQuery(clientsQueryOptions)

  const [sheetState, sheetDispatch] = useReducer(reducer, initialState)

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
      <DataTable 
        columns={columns} 
        data={data} 
        initialVisibilty={initialVisibilty} 
        meta={{ showSheet: handleShowSheet, categories }}
      />
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