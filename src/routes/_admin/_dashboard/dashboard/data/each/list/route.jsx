import { createFileRoute } from '@tanstack/react-router'
import { defaultTableModelState } from '@/hooks/use-TableModel'
import PendingComponent from '@/routes/-ui/PendingComponent'
import { COMPANY_TYPE_NAMES } from '@/constants'
import { addNote, fetchFacets, fetchNegotiator, fetchNegotiatorByNids, fetchNegotiators, fetchNotes } from '@/api/fourProp'
import { deleteLog } from '@/api/api-fakeServer'
import { getMassBizchatList, getMassBizchatNotEmailed, getMassBizchatStat, sendMassBizchat } from '@/api/bizchat'
import messagesCombiner from '@/components/CRMTable/combiners/messagesCombiner'
import { UserCard } from '@/components/CRMTable/components'

export const Route = createFileRoute('/_admin/_dashboard/dashboard/data/each/list')({
  // loader: ({ context }) => context.queryClient.ensureQueryData(context.queryOptions),
  pendingComponent: PendingComponent,
  beforeLoad: async ({ context: { auth } }) => {
    const { columns, version } = await import('./-ui/columns-each')

    const authUserId = auth.user.neg_id

    const services = {
      tableSSList: variables => fetchNegotiators(variables, authUserId),
      selectedDataPool: fetchNegotiatorByNids,
      facetList: fetchFacets,
      tableDialog: {
        getInfoById: id => fetchNegotiator(id),
        noteList: id => fetchNotes(id, auth),
        addNote,
        deleteNote: deleteLog
      },
      massBizchat: {
        onListRequest: getMassBizchatList,
        onListStatRequest: getMassBizchatStat,
        onCurrItemNotEmailedListRequest: getMassBizchatNotEmailed,
        onSendMassBizchat: sendMassBizchat
      }
    }

    const facets = [
      { columnId: "type", title: "Company type", names: COMPANY_TYPE_NAMES },
      { columnId: "company", title: "Company" },
      { columnId: "city", title: "City" },
      { columnId: "a", title: "Postcode" },
    ]

    return {
      tableName:  `d.${version}.each`,
      facets,
      services,
      defaultTableModelState: {
        ...defaultTableModelState,
        tableState: {
          ...defaultTableModelState.tableState,
          columnFilters: [{ id: "type", value: "A" }],
          sorting: [{ id: "last_contact", desc: true }]
        }
      },
      columns,
      tableDialogRenderMessages: messagesCombiner,
      userCardComponent: UserCard,
      authUserId
    }
  }
})