import { createFileRoute } from '@tanstack/react-router'
import { defaultTableModelState } from '@/hooks/use-TableModel'
import PendingComponent from '@/routes/-ui/PendingComponent'
import { addNote } from '@/api/fourProp'
import { deleteLog } from '@/api/api-fakeServer'
import { crmFacetList, crmFetchNotes, crmList, crmListById, crmListByIds, getMassBizchatList, getMassBizchatNotEmailed, getMassBizchatStat, sendMassBizchat } from '@/api/bizchat'
import { UserCard } from '@/components/CRMTable/components'
import ChatBoxEachSingleMessage from '@/components/CRMTable/components/ChatBoxEachSingleMessage'
import ChatBoxMyListSingleMessage from '@/components/CRMTable/components/ChatBoxMyListSingleMessage'

export const Route = createFileRoute('/_admin/_dashboard/dashboard/my-list')({
  pendingComponent: PendingComponent,
  beforeLoad: async ({ context: { auth } }) => {
    const { columns, version } = await import('./-columns')

    const authUserId = `U${auth.user.id}`

    const services = {
      tableSSList: variables => crmList(variables, authUserId),
      selectedDataPool: ids => crmListByIds(ids, authUserId),
      facetList: column => crmFacetList(column, authUserId),
      tableDialog: {
        getInfoById: id => crmListById(id, authUserId),
        noteList: id => crmFetchNotes(id, authUserId),
        addNote,
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
      { columnId: "company", title: "Company" }
    ]

    return {
      tableName:  `generic.${version}`,
      facets,
      services,
      defaultTableModelState: {
        ...defaultTableModelState,
        tableState: {
          ...defaultTableModelState.tableState,
          columnFilters: [],
          sorting: [{ id: "email", desc: true }]
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