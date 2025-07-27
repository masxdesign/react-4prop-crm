import { createFileRoute } from '@tanstack/react-router'
import { defaultTableModelState } from '@/hooks/use-TableModel'
import PendingComponent from '@/components/PendingComponent';
import { COMPANY_TYPE_NAMES } from '@/constants'
import { addNote, fetchFacets, fetchNegotiator, fetchNegotiatorByNids, fetchNegotiators, fetchNotes } from '@/services/fourProp'
import { getMassBizchatList, getMassBizchatNotEmailed, getMassBizchatStat, sendMassBizchat } from '@/services/bizchat'
import { UserCard } from '@/components/CRMTable/components'
import ChatBoxEachSingleMessage from '@/components/CRMTable/components/ChatBoxEachSingleMessage'

export const Route = createFileRoute('/_auth/_dashboard/each')({
  pendingComponent: PendingComponent,
  beforeLoad: async ({ context: { auth } }) => {
    const { columns, version } = await import('./-columns')

    const getBzId = (info) => info.id

    const services = {
      tableSSList: variables => fetchNegotiators(variables, auth.user.neg_id),
      selectedDataPool: fetchNegotiatorByNids,
      facetList: fetchFacets,
      tableDialog: {
        getInfoById: id => fetchNegotiator(id),
        getBzId,
        noteList: (info) => fetchNotes(info, auth),
        addNote: (variables) => addNote(variables, auth),
        deleteNote: () => {}
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
      title: "Manage agents on EACH",
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
      tableDialogRenderMessages: ([messages], info) => messages.map(item => {
        return {
          id: item.id,
          message: <ChatBoxEachSingleMessage info={info} auth={auth} {...item} />
        }
      }),
      authUserId: auth.user.neg_id,
      userCardComponent: UserCard,
      enableHoverCard: true
    }
  }
})