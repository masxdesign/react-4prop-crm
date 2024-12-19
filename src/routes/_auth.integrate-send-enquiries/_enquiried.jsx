import { subtypesQuery, suitablePropertiesEnquiriedQuery, typesQuery } from '@/store/listing.queries'
import { createFileRoute, retainSearchParams } from '@tanstack/react-router'
import { isEmpty, isEqual } from 'lodash'

const defaultFilterValues = {
  searchRef: null,
  choice: null
}

export const Route = createFileRoute('/_auth/integrate-send-enquiries/_enquiried')({
  loader: ({ context: { queryClient } }) => {
    return Promise.all([
      queryClient.ensureQueryData(typesQuery),
      queryClient.ensureQueryData(subtypesQuery)
    ])
  },
  search: {
    middlewares: [retainSearchParams(['filters'])],
  },
  beforeLoad: ({ search }) => {

    const isFiltersPure = isEmpty(search.filters) 
      || isEqual(search.filters, defaultFilterValues)

    const filters = isFiltersPure 
      ? defaultFilterValues
      : {
        ...defaultFilterValues,
        ...search.filters
      } 

    const isFiltersDirty = !(isEmpty(filters) 
      || isEqual(filters, defaultFilterValues))

    const page = Number(search.page ?? 1)
    
    return {
        page,
        filters,
        isFiltersDirty
    }

  },
  validateSearch : (search) => {
    return {
      page: Number(search.page) === 1 ? undefined : search.page,
      filters: isEmpty(search.filters) || isEqual(search.filters, defaultFilterValues)  
        ? undefined
        : search.filters
    }

  }
})