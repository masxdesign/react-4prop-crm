import { useMemo, useReducer } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { find } from "lodash"
import { getMassBizchatList, sendMassBizchat } from "@/api/bizchat"

const initialState = {
    open: false,
    currItemId: null,
    message: "",
    subjectLine: ""
}

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

export default function useSendBizchatDialog ({ auth, selectionControlModal }) { 
    const { selected, onDeselectAllAndApply } = selectionControlModal

    const [state, dispatch] = useReducer(sendBizchatDialogReducer, initialState)

    const { open, message, subjectLine, currItemId } = state

    const from = auth.user.neg_id

    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['getMassBizchatList', from],
        queryFn: () => getMassBizchatList({ from }),
        initialData: []
    })

    const sendRequest = useMutation({
        mutationFn: sendMassBizchat,
        retry: 3,
        retryDelay: 900
    })

    const currItem = useMemo(
        () => find(query.data, { id: currItemId }),
        [query.data, currItemId]
    )

    const onAddItem = ({ message, subjectLine }) => {
        sendRequest.mutate({ 
            from,
            recipients: selected,
            subjectLine,
            message
        }, {
            onSuccess (data) {
                console.log(data, query.data);
                queryClient.setQueryData(['getMassBizchatList', from], (prev) => ([data, ...prev]))
                dispatch(selectItem(data.id))
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

    const onItemSelect = (id) => {
        dispatch(selectItem(id))
    }

    const onOpenChange = (open) => {
        dispatch(changeOpen(open))
    }

    return {
        query,
        sendRequest,
        open,
        message,
        subjectLine,
        currItem,
        onAddItem,
        onMessageChange,
        onSubjectLineChange,
        onItemSelect,
        onOpenChange
    }
}