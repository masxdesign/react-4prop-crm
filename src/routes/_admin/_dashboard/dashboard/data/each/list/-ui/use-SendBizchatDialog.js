import { useEffect, useMemo, useReducer } from "react"
import { sendBizchat } from "@/api/fourProp"
import delay from "@/utils/delay"
import { useMutation } from "@tanstack/react-query"
import { find, map } from "lodash"
import * as Yup from "yup"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from 'uuid'
import { yupResolver } from "@hookform/resolvers/yup"

const messageSchema = Yup.object().shape({
    message: Yup.string().required()
})

const initialState = {
    items: [],
    open: false,
    currItemId: null,
    message: "",
    subjectLine: "",
    itemDataCollection: {},
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
                {
                    ...payload,
                    recipients: map(payload.recipients, 'id')
                },
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
                itemDataCollection: {
                    ...state.itemDataCollection,
                    ...Object.fromEntries(
                        action.payload.recipients
                            .map((recipient) => ([recipient.id, recipient]))
                    )
                },
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

export default function useSendBizchatDialog(selectionControl, auth) {
    const storageKey = `SendBizchatDialog`
    const [state, dispatch] = useReducer(sendBizchatDialogReducer, storageKey, init)
    const { selected } = selectionControl

    const { open, message, subjectLine, currItemId, items: items_, itemDataCollection, status } = state

    const paused = status === "paused"
    const isPausing = status === "pausing"

    const items = useMemo(() => {

        return items_.map((item) => ({
            ...item,
            progress: Math.ceil(100*(item.sent.length/item.recipients.length))
        }))

    }, [items_])

    const currItem = useMemo(
        () => find(items, { id: currItemId }),
        [items, currItemId]
    )

    const recipients = useMemo(() => selected.map((item) => {
        const { id, first, last, email, company, _queryKey: [, , , { pageIndex }] } = item

        return {
            id, 
            first, 
            last,
            email,
            company,
            _page: pageIndex + 1
        }
    }), [selected])

    const lastItemPending = useMemo(() => items.find(({ status }) => status === "pending"), [items])
    const nextRecipient = useMemo(() => {

        if(!lastItemPending) return null

        const { id, recipients, sent } = lastItemPending

        return {
            recipientId: recipients.find((recipientId) => !sent.includes(recipientId)),
            itemId: id
        }

    }, [lastItemPending])

    const sendBizchatMutation = useMutation({
        mutationFn: (variables) => sendBizchat(variables),
        retry: 3,
        retryDelay: 900
    })

    const sendNextRecipient = async () => {
        // if (import.meta.env.PROD) {
            if (!nextRecipient) throw new Error('nextRecipient is undefined')
            if (!auth.user?.neg_id) throw new Error('auth.user?.neg_id is undefined')

            await delay(1000)
            
            await sendBizchatMutation.mutateAsync({
                subjectLine: lastItemPending.subjectLine,
                message: lastItemPending.body,
                from: auth.user?.neg_id,
                recipient: nextRecipient.recipientId
            })
            
        // } else {
        //     await delay(1000)
        // }

        dispatch(recipientMarkSent(nextRecipient))
        console.log('sent!', nextRecipient);

    }

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }, [state])

    useEffect(() => {

        nextRecipient && !paused && sendNextRecipient()

    }, [nextRecipient?.recipientId, paused])

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

    const onAddItem = ({ message, subjectLine }) => {
        if (lastItemPending && !paused) throw new Error("Please wait for last message to finish sending")
        dispatch(itemAdded({ recipients, body: message, subjectLine }))
        selectionControl.onDeselectAllAndApply()
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
        recipients,
        onPause,
        onResume,
        itemDataCollection,
        lastItemPending,
        onAddItem,
        onMessageChange,
        onSubjectLineChange,
        onCancel,
        onItemSelect,
        onOpenChange,
        selectionControl
    }
}