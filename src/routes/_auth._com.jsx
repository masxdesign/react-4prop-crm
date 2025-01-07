import { createFileRoute, retainSearchParams } from '@tanstack/react-router'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { decodeFromBinary } from '@/utils/binary'
import { isEmpty, isEqual } from 'lodash'

const defaultFilterValues = {
  searchRef: null,
  choice: null
}

export const Route = createFileRoute('/_auth/_com')({
  search: {
      middlewares: [
        retainSearchParams(['_origin']),
        retainSearchParams(['filters'])
      ],
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

    let origin = null

    if (search._origin) {
        origin = new URL(`${FOURPROP_BASEURL}${decodeFromBinary(search._origin)}`)
    }

    return {
        origin,
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