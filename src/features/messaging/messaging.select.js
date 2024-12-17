import { attachmentCombiner } from "@/components/Uppy/utils"
import { truncate } from "lodash"

export const messageCombiner = (type, body, from, chatId) => {
    if (type === 'A') {
        const data = JSON.parse(body)
        const [messageStr, ...attachments] = data
        return {
            body: messageStr,
            teaser: truncate(messageStr, { length: 200 }),
            attachments: attachments.map(file => attachmentCombiner(file, from, chatId))
        }
    }

    return {
        body,
        teaser: truncate(body, { length: 200 })
    }
}