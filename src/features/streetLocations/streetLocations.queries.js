import { queryOptions } from '@tanstack/react-query'
import {
  fetchStreetLocationsByPrefix,
  fetchStreetLocation,
} from '@/services/streetLocationService'

export const streetLocationsByPrefixQuery = (prefix) =>
  queryOptions({
    queryKey: ['streetLocations', 'byPrefix', prefix],
    queryFn: () => fetchStreetLocationsByPrefix(prefix),
    enabled: !!prefix,
    staleTime: 1000 * 60 * 5,
  })

export const streetLocationDetailQuery = (id) =>
  queryOptions({
    queryKey: ['streetLocations', 'detail', id],
    queryFn: () => fetchStreetLocation(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  })
