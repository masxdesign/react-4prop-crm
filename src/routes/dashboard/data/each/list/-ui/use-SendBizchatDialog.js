import delay from "@/utils/delay"
import { find, map } from "lodash"
import { useEffect, useMemo, useReducer, useState } from "react"
import { v4 as uuidv4 } from 'uuid'

const initialState = {
    items: [],
    open: false,
    currItemId: null,
    message: "",
    itemDataCollection: {}
}

const createItem = ({ recipients = [], body = "" }) => ({
    id: uuidv4(),
    body,
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

const selectItem = (itemId) => ({
    type: "ITEM_SELECTED",
    payload: itemId
})

const changeOpen = (open) => ({
    type: "OPEN_DIALOG_CHANGED",
    payload: open
})

const recipientMarkSent = (recipientId, itemId) => ({
    type: "RECIPIENT_MARK_SENT",
    payload: recipientId,
    meta: { itemId },
})

const itemHasCompleted = (itemId) => ({
    type: "ITEM_COMPLETED",
    meta: { itemId },
})

function itemsSlice(state, { type, meta, payload = null }) {
    switch (type) {
        case "ITEM_ADDED":
            return [
                ...state, 
                {
                    ...payload,
                    recipients: map(payload.recipients, 'id')
                }
            ]
        case "RECIPIENT_MARK_SENT":
            return state.map((message) =>
                message.id === meta.itemId
                    ? {
                        ...message,
                        sent: [
                            ...message.sent, 
                            payload
                        ],
                        updated: new Date(),
                      }
                    : message
            )
        case "ITEM_COMPLETED":
            return state.map((message) =>
                message.id === meta.itemId
                    ? {
                        ...message,
                        status: "completed",
                        updated: new Date(),
                      }
                    : message
            )
    }
}

function sendBizchatDialogReducer (state, action) {
    const { type, payload = null } = action

    switch (type) {
        case "OPEN_DIALOG_CHANGED":
            return {
                ...state,
                open: payload
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
    const [state, dispatch] = useReducer(sendBizchatDialogReducer, initialState)
    const { selected } = selectionControl

    const { open, message, currItemId, items, itemDataCollection } = state

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

    const resume = async () => {

        if(!lastItemPending) return

        for(const recipient of lastItemPending.recipients) {
            if (lastItemPending.sent.includes(recipient)) continue

            await delay(600)
            dispatch(recipientMarkSent(recipient, lastItemPending.id))
        }

        dispatch(itemHasCompleted(lastItemPending.id))

    }

    useEffect(() => {

        resume()

    }, [items.length])

    const onAddItem = (body) => {
        if (lastItemPending) throw new Error("Please wait for last message to finish sending")
        dispatch(itemAdded({ recipients, body }))
        selectionControl.onDeselectAllAndApply()
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
        open,
        items,
        message,
        currItem,
        recipients,
        itemDataCollection,
        lastItemPending,
        onAddItem,
        onMessageChange,
        onItemSelect,
        onOpenChange
    }
}