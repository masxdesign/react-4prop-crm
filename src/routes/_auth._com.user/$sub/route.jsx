import { createFileRoute, notFound } from '@tanstack/react-router'
import { subtypesQuery, suitablePropertiesEnquiriedQuery, typesQuery } from '@/store/listing.queries'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { produce } from 'immer'

export const Route = createFileRoute('/_auth/_com/user/$sub')({
  loader: ({ context: { queryClient } }) => {
      return Promise.all([
        queryClient.ensureQueryData(typesQuery),
        queryClient.ensureQueryData(subtypesQuery)
      ])
  },
  beforeLoad: ({ params, search, context: { auth, queryClient, page, filters, perpage } }) => {

    const activeListQuery = suitablePropertiesEnquiriedQuery({ page, perpage, filters, hash: search.i })
    const inactiveListQuery = suitablePropertiesEnquiriedQuery({ page, perpage, filters, inactive: true, hash: search.i })

    switch (params.sub) {
      case "inactive": {

        const onGradeChange = (pid, grade) => {
          queryClient.invalidateQueries({
            queryKey: activeListQuery.queryKey
          })
          queryClient.setQueryData(inactiveListQuery.queryKey, (prev) => {
            return produce(prev, draft => {
              const idx = draft.results.findIndex(prevRow => prevRow.pid === pid)
      
              if (idx > -1) {
                if (grade > 1) { // remove from inactive list
                  delete draft.results.splice(idx, 1)
                  return
                }
              
                draft.results[idx].grade = grade
              }
      
            })
          })
        }

        return {
            pageTitle: "Inactive",
            pageDescription: "",
            onGradeChange,
            listQuery: inactiveListQuery
        }
      }
      case "active": {

        const onGradeChange = (pid, grade) => {
          queryClient.invalidateQueries({
            queryKey: inactiveListQuery.queryKey
          })
          queryClient.setQueryData(activeListQuery.queryKey, (prev) => {
            return produce(prev, draft => {
              const idx = draft.results.findIndex(prevRow => prevRow.pid === pid)
      
              if (idx > -1) {
                if (grade === 1) {
                  delete draft.results.splice(idx, 1)
                  return
                }
              
                draft.results[idx].grade = grade
              }
      
            })
          })
        }

        const X = (
          <span 
              style={{ backgroundImage: `url(${FOURPROP_BASEURL}/svg/close/10/999)` }}
              className="bg-no-repeat size-5 cursor-pointer bg-cover inline-block align-middle translate-y-[-1px]"
          />
        )

        return {
            pageTitle: "Active",
            pageDescription: auth.isAgent ? (
              <>
                View and reply to grade shares and enquiries made on 4prop
              </>
            ) : (
              <>
                View and reply to messages sent back from the agent. If you select {X} that Property is regraded unsuitable and stored in the inactive listing.
              </>
            ),
            onGradeChange,
            listQuery: activeListQuery
        }

      }
      default:
        throw notFound()
    }

  }
})