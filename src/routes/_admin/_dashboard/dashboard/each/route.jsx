import { createFileRoute } from '@tanstack/react-router'
import { defaultTableModelState } from '@/hooks/use-TableModel'
import PendingComponent from '@/routes/-ui/PendingComponent'
import { COMPANY_TYPE_NAMES } from '@/constants'
import { addNote, fetchFacets, fetchNegotiator, fetchNegotiatorByNids, fetchNegotiators, fetchNotes } from '@/api/fourProp'
import { deleteLog } from '@/api/api-fakeServer'
import { getMassBizchatList, getMassBizchatNotEmailed, getMassBizchatStat, sendMassBizchat } from '@/api/bizchat'
import { UserCard } from '@/components/CRMTable/components'
import ChatBoxEachSingleMessage from '@/components/CRMTable/components/ChatBoxEachSingleMessage'

export const Route = createFileRoute('/_admin/_dashboard/dashboard/each')({
  pendingComponent: PendingComponent,
  beforeLoad: async ({ context: { auth } }) => {
    const { columns, version } = await import('./-columns')

    const authUserId = auth.user.neg_id

    const services = {
      tableSSList: variables => fetchNegotiators(variables, authUserId),
      selectedDataPool: fetchNegotiatorByNids,
      facetList: fetchFacets,
      tableDialog: {
        getInfoById: id => fetchNegotiator(id),
        noteList: id => fetchNotes(id, auth),
        addNote: (variables, id) => addNote(variables, id, authUserId),
        deleteNote: deleteLog
      },
      massBizchat: {
        getList: getMassBizchatList,
        getStat: getMassBizchatStat,
        getNotEmailedList: getMassBizchatNotEmailed,
        sendMassBizchat
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
      tableDialogRenderMessages: ([messages]) => messages.map(item => {
        return {
          id: item.id,
          message: <ChatBoxEachSingleMessage {...item} />
        }
      }),
      authUserId,
      userCardComponent: UserCard,
      enableHoverCard: true
    }
  }
})