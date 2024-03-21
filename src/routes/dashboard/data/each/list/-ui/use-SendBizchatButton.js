import { useMemo, useReducer, useState } from "react"
import { v4 as uuidv4 } from 'uuid'

const createItem = ({ recipients = [], body = "" }) => ({
    id: uuidv4(),
    body,
    recipients,
    sent: [],
    status: "sending",
    created: new Date(),
    updated: null,
})

const itemAdded = (item) => ({
    type: "ITEM_ADDED",
    payload: item,
})

const recipientMarkSent = (recipientId, messageId) => ({
    type: "RECIPIENT_MARK_SENT",
    payload: recipientId,
    meta: { messageId },
})

function messagesReducer(state, { type, meta, payload = null }) {
    switch (type) {
        case "ITEM_ADDED":
            return [...state, payload]
        case "RECIPIENT_SENT":
            return state.map((message) =>
                message.id === meta.messageId
                    ? {
                          ...message,
                          sent: [...message.sent, payload],
                          updated: new Date(),
                      }
                    : message
            )
    }
}

export default function useSendBizchatButton({ selected }) {
    const [open, setOpen] = useState()
    const [newMessage, setNewMessage] = useState("")
    const [currMessageId, setCurrMessageId] = useState(null)
    const [messages, dispatch] = useReducer(messagesReducer, [])

    const currMessage = useMemo(
        () => find(messages, { id: currMessageId }),
        [currMessageId, messages]
    )

    const onCreateMessage = (recipients, body) => {
        const item = createItem({ recipients, body })
        dispatch(itemAdded(item))
        setCurrMessageId(item.id)
        setNewMessage("")
    }

    const onMessageChange = (e) => {
        dispatch(writeMessage(e.target.value, currMessageId))
    }

    const onNewMessageChange = (e) => {
        setNewMessage(e.target.value)
    }

    const onMessageSelect = (id) => {
        setCurrMessageId(id)
    }

    return {
        open,
        currMessage,
        newMessage,
        messages,
        onCreateMessage,
        onMessageChange,
        onMessageSelect,
        onNewMessageChange,
        onOpenChange: setOpen
    }
}