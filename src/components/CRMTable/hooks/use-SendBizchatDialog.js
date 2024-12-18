import { useEffect, useMemo, useReducer, useState } from "react"
import { Uppy } from "@uppy/core"
import { useUppyState } from "@uppy/react"
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import _, { find } from "lodash"
import { getMassBizchatList, getMassBizchatNotEmailed, getMassBizchatStat, sendMassBizchat } from "@/services/bizchat"
import { filesSelector } from "@/hooks/use-Chatbox"
import { attachmentCombiner } from "@/components/Uppy/utils"

const initialState = {
    open: false,
    currItemId: null,
    justSent: null,
    message: "",
    subjectLine: ""
}
const justSentReceived = (itemId) => ({
    type: "JUST_SENT",
    payload: itemId
})

const changeMessage = (message) => ({
    type: "MESSAGE_CHANGED",
    payload: message
})

const changeSubjectLine = (subjectLine) => ({
    type: "SUBJECTLINE_CHANGED",
    payload: subjectLine
})

const selectItem = (itemId) => ({
    type: "ITEM_SELECTED",
    payload: itemId
})

const changeOpen = (open) => ({
    type: "OPEN_DIALOG_CHANGED",
    payload: open
})

function sendBizchatDialogReducer (state, action) {
    const { type, meta, payload = null } = action

    switch (type) {
        case "JUST_SENT":
            return {
                ...state,
                justSent: payload
            }
        case "OPEN_DIALOG_CHANGED":
            return {
                ...state,
                open: payload
            }
        case "SUBJECTLINE_CHANGED":
            return {
                ...state,
                subjectLine: payload
            }
        case "MESSAGE_CHANGED":
            return {
                ...state,
                message: payload
            }
        case "ITEM_SELECTED":
            return {
                ...state,
                currItemId: payload
            }
    }
}

export default function useSendBizchatDialog ({ 
    from, 
    services: {
        massBizchat: {
            getList, 
            getStat, 
            getNotEmailedList, 
            sendMassBizchat
        }
    },
    selectionControlModal,
    makeFetchNegQueryOptions
}) {
    const [uppy] = useState(() => new Uppy({
        restrictions: {
          maxNumberOfFiles: 3,
          allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
          maxFileSize: 15_000_000
        }
    }))

    const files = useUppyState(uppy, filesSelector)

    const { selected, onDeselectAllAndApply } = selectionControlModal

    const initialStateFromStorage = useMemo(() => {
        const dataStorageString = window.localStorage.getItem('SendBizchatDialog')

        if (!dataStorageString) return initialState
        
        return {
            ...initialState,
            ...JSON.parse(dataStorageString)
        }
    }, [])

    const [state, dispatch] = useReducer(sendBizchatDialogReducer, initialStateFromStorage)

    const { open, message, subjectLine, currItemId, justSent } = state

    useEffect(() => {

        window.localStorage.setItem('SendBizchatDialog', JSON.stringify({ message, subjectLine, currItemId }))

    }, [open, message, subjectLine, currItemId])

    const queryClient = useQueryClient()

    const listQueryOptions = queryOptions({
        queryKey: ['massBizchatList', from],
        queryFn: () => getList({ from })
    })

    const statQueryOptions = queryOptions({
        queryKey: ['massBizchatStat', from],
        queryFn: () => getStat({ from }),
        select (data) {
            const stat = data.map(([crm_id, itemsString]) => {
                const recipients = itemsString.map(itemString => {
                    const [recipient, chat_id, unread_total] = itemString.split(',')

                    return {
                        chat_id,
                        recipient, 
                        unread_total: parseInt(unread_total)
                    }
                })

                return {
                    crm_id,
                    recipients: _.orderBy(recipients, ['unread_total'], ['desc']),
                    unread_total: _.sumBy(recipients, 'unread_total')
                }
            })

            return stat
        },
        staleTime: 60_000
    })

    const notEmailedQueryOptions = queryOptions({
        queryKey: ['massBizchatCurrItemNotEmailedList', currItemId],
        queryFn: () => getNotEmailedList({ crm_id: currItemId }),
        staleTime: 60_000
    })

    const onRefreshList = () => {

        queryClient.invalidateQueries({ queryKey: statQueryOptions.queryKey })

        if (currItemId) {
            queryClient.invalidateQueries({ queryKey: notEmailedQueryOptions.queryKey })
        }
    
    }


    const sendRequest = useMutation({
        mutationFn: sendMassBizchat,
        retry: 3,
        retryDelay: 900
    })

    const onItemSelect = (id) => {
        dispatch(selectItem(id))
    }

    const onAddItem = ({ message, subjectLine }) => {
        sendRequest.mutate({ 
            from,
            recipients: selected,
            subjectLine,
            message,
            files
        }, {
            onSuccess (data) {
                uppy.clear()
                queryClient.invalidateQueries({ queryKey: statQueryOptions.queryKey })
                queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey })
                onItemSelect(data.id)
                dispatch(justSentReceived(data.id))
                onDeselectAllAndApply()
            }
        })
    }

    const onSubjectLineChange = (value) => {
        dispatch(changeSubjectLine(value))
    }

    const onMessageChange = (value) => {
        dispatch(changeMessage(value))
    }

    const onOpenChange = (open) => {
        dispatch(changeOpen(open))
    }

    return {
        listQueryOptions,
        statQueryOptions,
        notEmailedQueryOptions,
        makeFetchNegQueryOptions,
        onRefreshList,
        sendRequest,
        open,
        message,
        subjectLine,
        currItemId,
        justSent,
        onAddItem,
        uppy,
        onMessageChange,
        onSubjectLineChange,
        onItemSelect,
        onOpenChange
    }
}

useSendBizchatDialog.use = {
    query ({ model, selected }) {
        const {
            listQueryOptions,
            statQueryOptions,
            currItemId,
            justSent
        } = model

        const query = useQuery({ ...listQueryOptions, initialData: [] })
        const statQuery = useQuery(statQueryOptions)

        const data = useMemo(() => {
            return query.data.map(item => {
                const stat = _.find(statQuery.data, { crm_id: item.id })

                let message_text = item.message
                let attachments = []

                if (item.type === 'A') {
                    const [a_message_text, ...files] = JSON.parse(message_text)

                    message_text = a_message_text
                    attachments = files.map(file => attachmentCombiner(file))
                }
    
                return {
                    ...item,
                    message: message_text,
                    attachments,
                    recipients: stat?.recipients ? _.map(stat.recipients, 'recipient'): item.recipients,
                    statOfRecipients: Object.fromEntries(stat?.recipients.map(item => ([item.recipient, item])) ?? []),
                    stat,
                    justSent: item.id === justSent
                }
            })
        }, [query.data, statQuery.data, justSent])
    
        const currItem = useMemo(
            () => find(data, { id: currItemId }),
            [data, currItemId]
        )
    
        const recipients = currItem?.recipients ?? selected

        return {
            query,
            statQuery,
            data,
            currItem,
            recipients
        }
    }
}