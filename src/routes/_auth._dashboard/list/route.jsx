import { createFileRoute } from '@tanstack/react-router'
import { defaultTableModelState } from '@/hooks/use-TableModel'
import PendingComponent from '@/components/PendingComponent'
import { crmAddNote, crmFacetList, crmFetchNotes, crmList, crmListById, crmListByIds, crmListUpdateDetails, getCrmEnquiries, getMassBizchatList, getMassBizchatNotEmailed, getMassBizchatStat, sendMassBizchat } from '@/services/bizchat'
import { UserCard } from '@/components/CRMTable/components'
import ChatBoxMyListSingleMessage from '@/components/CRMTable/components/ChatBoxMyListSingleMessage'

export const Route = createFileRoute('/_auth/_dashboard/list')({
  pendingComponent: PendingComponent,
  beforeLoad: async ({ context: { auth } }) => {
    const { columns, version } = await import('./-columns')

    const authUserId = `U${auth.user.id}`

    const services = {
      tableSSList: variables => crmList(variables, authUserId),
      selectedDataPool: ids => crmListByIds(ids, authUserId),
      facetList: column => crmFacetList(column, authUserId),
      tableDialog: {
        getInfoById: import_id => crmListById(import_id, authUserId),
        getEnquiries: (import_id, filterBy) => getCrmEnquiries(import_id, authUserId, filterBy),
        noteList: import_id => crmFetchNotes(import_id, authUserId),
        addNote: (variables, import_id) => crmAddNote(variables, import_id, authUserId),
        deleteNote: () => {},
        listUpdateDetails: crmListUpdateDetails
      },
      massBizchat: {
        getList: getMassBizchatList,
        getStat: getMassBizchatStat,
        getNotEmailedList: getMassBizchatNotEmailed,
        sendMassBizchat
      }
    }

    const facets = [
      { columnId: "company", title: "Company" }
    ]

    return {
      tableName:  `list`,
      tableVersion: version,
      facets,
      services,
      defaultTableModelState: {
        ...defaultTableModelState,
        tableState: {
          ...defaultTableModelState.tableState,
          columnFilters: [],
          sorting: [{ id: "created", desc: true }]
        }
      },
      columns,
      tableDialogRenderMessages: ([messages]) => messages.map(item => {
        return {
          id: item.id,
          message: <ChatBoxMyListSingleMessage {...item} />
        }
      }),
      authUserId,
      userCardComponent: UserCard,
      enableHoverCard: true
    }
  }
})