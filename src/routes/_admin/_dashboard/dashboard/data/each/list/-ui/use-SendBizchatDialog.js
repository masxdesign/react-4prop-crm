import { useEffect, useMemo, useReducer } from "react"
import { fetchSelectedNegotiatorsDataQueryOptions, sendBizchat } from "@/api/fourProp"
import delay from "@/utils/delay"
import { useMutation } from "@tanstack/react-query"
import { find, map } from "lodash"
import { v4 as uuidv4 } from 'uuid'

const initialState = {
    items: [],
    open: false,
    currItemId: null,
    message: "",
    subjectLine: "",
    status: "running"
}

const init = (storageKey) => JSON.parse(localStorage.getItem(storageKey)) || initialState

const createItem = ({ recipients = [], body = "", subjectLine = "" }) => ({
    id: uuidv4(),
    body,
    subjectLine,
    recipients,
    sent: [],
    status: "pending",
    created: new Date(),
    updated: null,
})

const itemAdded = (options) => ({
    type: "ITEM_ADDED",
    payload: createItem(options),
})

const changeMessage = (body) => ({
    type: "MESSAGE_CHANGED",
    payload: body
})

const changeSubjectLine = (subjectLine) => ({
    type: "SUBJECTLINE_CHANGED",
    payload: subjectLine
})

const selectItem = (itemId) => ({
    type: "ITEM_SELECTED",
    payload: itemId
})

const cancelItemRequest = (itemId) => ({
    type: "CANCEL_ITEM_REQUESTED",
    meta: { itemId }
})

const cancelItem = (itemId) => ({
    type: "ITEM_CANCELLED",
    meta: { itemId }
})

const changeOpen = (open) => ({
    type: "OPEN_DIALOG_CHANGED",
    payload: open
})

const resume = () => ({
    type: "RESUME"
})

const pauseRequest = () => ({
    type: "PAUSE_REQUESTED"
})

const recipientMarkSent = ({ recipientId, itemId }) => ({
    type: "RECIPIENT_MARK_SENT",
    payload: recipientId,
    meta: { itemId }
})

function itemsSlice(state, { type, meta, payload = null }) {
    switch (type) {
        case "CANCEL_ITEM_REQUESTED":
            return state.map(
                (message) => {
                    if (message.id !== meta.itemId) return message

                    return {
                        ...message,
                        status: "canceling",
                        updated: new Date()
                    }
                }
            )
        case "ITEM_CANCELLED":
            return state.map(
                (message) => {
                    if (message.id !== meta.itemId) return message

                    return {
                        ...message,
                        status: "cancelled",
                        updated: new Date()
                    }
                }
            )
        case "ITEM_ADDED":
            return [
                payload,
                ...state
            ]
        case "RECIPIENT_MARK_SENT":
            return state.map(
                (message) => {

                    if (message.id !== meta.itemId || message.sent.includes(payload)) return message

                    const sent = [
                        ...message.sent, 
                        payload
                    ]

                    return {
                        ...message,
                        sent,
                        status: sent.length < message.recipients.length
                            ? message.status === "canceling" ? "cancelled": message.status
                            : "completed"
                        ,
                        updated: new Date(),
                    }
                }
            )
    }
}

function sendBizchatDialogReducer (state, action) {
    const { type, meta, payload = null } = action

    switch (type) {
        case "OPEN_DIALOG_CHANGED":
            return {
                ...state,
                open: payload,
                currItemId: find(state.items, { status: "pending" })?.id ?? initialState.currItemId
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
        case "ITEM_ADDED":
            return {
                ...state,
                items: itemsSlice(state.items, action),
                currItemId: action.payload.id,
                message: initialState.message,
                status: "running"
            }
        case "PAUSE_REQUESTED":
            return {
                ...state,
                status: "pausing"
            }
        case "RESUME":
            return {
                ...state,
                status: "running"
            }
        case "ITEM_COMPLETED":
        case "ITEM_CANCELLED":
        case "CANCEL_ITEM_REQUESTED":
            return {
                ...state,
                items: itemsSlice(state.items, action)
            }
        case "RECIPIENT_MARK_SENT":
            return {
                ...state,
                items: itemsSlice(state.items, action),
                status: state.status === "pausing" ? "paused" : "running"
            }
        case "ITEM_SELECTED":
            return {
                ...state,
                currItemId: payload
            }
    }
}

const useSendBizchatMany = ({ paused, auth, state, dispatch }) => {
    const sendBizchatMutation = useMutation({
        mutationFn: async (lastItemPending) => {
            if (!auth.user?.neg_id) throw new Error('auth.user.neg_id is undefined')

            const variables = {
                subjectLine: lastItemPending.subjectLine,
                message: lastItemPending.body,
                from: auth.user.neg_id,
                recipient: lastItemPending.nextRecipient.recipientId
            }

            if (import.meta.env.PROD) {

                await delay(1000)
                return sendBizchat(variables)
                
            } else {
                console.log('Sending in development mode!', variables);
                return delay(1000)
            }
        },
        onSuccess (_, lastItemPending) {
            dispatch(recipientMarkSent(lastItemPending.nextRecipient))
            console.log('sent!', lastItemPending.nextRecipient);
        },
        retry: 3,
        retryDelay: 900
    })

    const items = useMemo(() => {
        return state.items.map((item) => ({
            ...item,
            progress: Math.ceil(100*(item.sent.length/item.recipients.length))
        }))
    }, [state.items])

    const lastItemPending = useMemo(() => {
        const last = items.find(({ status }) => status === "pending")

        if (!last) return null

        const nextRecipientId = last.recipients.find(recipientId => !last.sent.includes(recipientId))

        return {
            ...last,
            nextRecipient: {
                key: `${last.id}.${nextRecipientId}`,
                itemId: last.id,
                recipientId: nextRecipientId
            }
        }
    }, [items])

    useEffect(() => {

        lastItemPending?.nextRecipient && !paused 
            && sendBizchatMutation.mutateAsync(lastItemPending)

    }, [lastItemPending?.nextRecipient.key, paused])

    return {
        lastItemPending,
        items
    }
}

const storageKey = `SendBizchatDialog`

export default function useSendBizchatDialog({ selected, auth, onDeselectAllAndApply }) { 
    const [state, dispatch] = useReducer(sendBizchatDialogReducer, storageKey, init)

    const { open, message, subjectLine, currItemId, status } = state

    const paused = status === "paused"
    const isPausing = status === "pausing"

    const { items, lastItemPending } = useSendBizchatMany({ paused, auth, state, dispatch })

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }, [state])

    const currItem = useMemo(
        () => find(items, { id: currItemId }),
        [items, currItemId]
    )

    const onAddItem = ({ message, subjectLine }) => {
        if (lastItemPending && !paused) throw new Error("Please wait for last message to finish sending")
        dispatch(itemAdded({ recipients: selected, body: message, subjectLine }))
        onDeselectAllAndApply()
    }

    const onPause = () => {
        dispatch(pauseRequest())
    }

    const onResume = () => {
        dispatch(resume())
    }

    const onCancel = (itemId) => {
        if (paused) return dispatch(cancelItem(itemId))
        dispatch(cancelItemRequest(itemId))
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
        paused,
        isPausing,
        open,
        items,
        message,
        subjectLine,
        currItem,
        onPause,
        onResume,
        lastItemPending,
        onAddItem,
        onMessageChange,
        onSubjectLineChange,
        onCancel,
        onItemSelect,
        onOpenChange
    }
}