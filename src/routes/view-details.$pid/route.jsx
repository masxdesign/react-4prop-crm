import { fetchEnquiredPropertyByPidQuery, subtypesQuery, typesQuery } from '@/store/listing.queries'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { produce } from 'immer'

export const Route = createFileRoute('/view-details/$pid')({
    loader: ({ context: { queryClient, listQuery } }) => {
        return Promise.all([
            queryClient.ensureQueryData(typesQuery),
            queryClient.ensureQueryData(subtypesQuery),
            queryClient.ensureQueryData(listQuery),
        ])
    },
    beforeLoad: ({ params, search, context: { auth, queryClient } }) => {

        if (!auth.isAuthenticated && !search.i) {
            throw redirect({
                to: '/crm/login',
                search: {
                    redirect: location.href.replace(location.origin, '')
                }
            })
        }

        const listQuery = fetchEnquiredPropertyByPidQuery(params.pid, search.i, search.a)

        return {
            onGradeChange: (pid, grade) => { 
                queryClient.setQueryData(listQuery.queryKey, (prev) => {
                    return produce(prev, draft => {
                      const idx = draft.results.findIndex(prevRow => prevRow.pid === pid)
              
                      if (idx > -1) {
                        if (grade === 1) {
                          delete draft.results.splice(idx, 1)
                          return
                        }
                      
                        draft.results[idx].grade = `${grade}`
                      }
              
                    })
                })
            },
            listQuery
        }
    }
})