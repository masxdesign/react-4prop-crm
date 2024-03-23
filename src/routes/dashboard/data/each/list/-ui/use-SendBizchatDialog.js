import delay from "@/utils/delay"
import { find, map } from "lodash"
import { useEffect, useMemo, useReducer } from "react"
import { v4 as uuidv4 } from 'uuid'

const initialState = {
    items: [],
    open: false,
    currItemId: null,
    message: "",
    itemDataCollection: {},
    pause: false
}

const init = (storageKey) => JSON.parse(localStorage.getItem(storageKey)) || initialState

const createItem = ({ recipients = [], body = "" }) => ({
    id: uuidv4(),
    body,
    recipients,
    sent: [],
    status: "pending",
    pausing: false,
    created: new Date(),
    updated: null,
})

const itemAdded = (options) => ({
    type: "ITEM_ADDED",
    payload: createItem(options),
})

const reuseMessage = (body) => ({
    type: "MESSAGE_REUSED",
    payload: body,
})

const changeMessage = (body) => ({
    type: "MESSAGE_CHANGED",
    payload: body
})

const selectItem = (itemId) => ({
    type: "ITEM_SELECTED",
    payload: itemId
})

const changeOpen = (open) => ({
    type: "OPEN_DIALOG_CHANGED",
    payload: open
})

const pauseSentout = (pause, itemId) => ({
    type: "SENDOUT_PAUSED",
    payload: pause,
    meta: { itemId }
})

const pauseRequest = (itemId) => ({
    type: "PAUSE_REQUESTED",
    meta: { itemId }
})

const recipientMarkSent = ({ recipientId, itemId }) => ({
    type: "RECIPIENT_MARK_SENT",
    payload: recipientId,
    meta: { itemId },
})

function itemsSlice(state, { type, meta, payload = null }) {
    switch (type) {
        case "SENDOUT_PAUSED":
            return state.map(
                (message) => {
                    if (message.id !== meta.itemId) return message

                    return {
                        ...message,
                        pausing: false
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
        case "PAUSE_REQUESTED":
            return state.map(
                (message) => {
                    if (message.id !== meta.itemId) return message

                    return {
                        ...message,
                        pausing: true
                    }
                }
            )
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
                            ? "pending"
                            : "completed"
                        ,
                        updated: new Date(),
                    }
                }
            )
    }
}

function sendBizchatDialogReducer (state, action) {
    const { type, payload = null } = action

    switch (type) {
        case "MESSAGE_REUSED":
            return {
                ...state,
                message: payload,
                currItemId: null
            }
        case "SENDOUT_PAUSED":
            return {
                ...state,
                items: itemsSlice(state.items, action),
                pause: payload
            }
        case "OPEN_DIALOG_CHANGED":
            return {
                ...state,
                open: payload,
                currItemId: find(state.items, { status: "pending" })?.id ?? initialState.currItemId
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
                }
            }
        case "PAUSE_REQUESTED":
        case "ITEM_COMPLETED":
        case "RECIPIENT_MARK_SENT":
            return {
                ...state,
                items: itemsSlice(state.items, action)
            }
        case "ITEM_SELECTED":
            return {
                ...state,
                currItemId: payload
            }
    }
}

export default function useSendBizchatDialog(selectionControl) {
    const storageKey = `SendBizchatDialog`
    const [state, dispatch] = useReducer(sendBizchatDialogReducer, storageKey, init)
    const { selected } = selectionControl

    const { open, message, currItemId, items: items_, itemDataCollection, pause } = state

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

    const sendNextRecipient = async () => {

        await delay(5000)
        
        if (lastItemPending.pausing) {
            dispatch(pauseSentout(true, lastItemPending.id))
        }

        dispatch(recipientMarkSent(nextRecipient))
        console.log('sent!', nextRecipient);

    }

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }, [state])

    useEffect(() => {

        nextRecipient && !state.pause && sendNextRecipient()

    }, [nextRecipient, state.pause])

    const onPause = () => {
        lastItemPending && dispatch(pauseRequest(lastItemPending.id))
    }

    const onResume = () => {
        dispatch(pauseSentout(false))
    }

    const onAddItem = (body) => {
        if (lastItemPending) throw new Error("Please wait for last message to finish sending")
        dispatch(itemAdded({ recipients, body }))
        selectionControl.onDeselectAllAndApply()
    }

    const onReuseMessage = (body) => {
        dispatch(reuseMessage(body))
    }

    const onMessageChange = (e) => {
        dispatch(changeMessage(e.target.value))
    }

    const onItemSelect = (id) => {
        dispatch(selectItem(id))
    }

    const onOpenChange = (open) => {
        dispatch(changeOpen(open))
    }

    return {
        pause,
        open,
        items,
        message,
        currItem,
        recipients,
        onPause,
        onResume,
        itemDataCollection,
        lastItemPending,
        onAddItem,
        onReuseMessage,
        onMessageChange,
        onItemSelect,
        onOpenChange
    }
}