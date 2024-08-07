import { useCallback } from "react"
import { format } from "date-fns"
import ChatboxSentdate from "@/routes/-ui/ChatboxSentdate"
import ChatboxBizchatMessage from "../../../../../../../-ui/ChatboxBizchatMessage"

const NEXT = "2",
    LAST = "1",
    NEXT_ONLY = "3",
    NO_NEXT = "4"

const useRenderMessage = () => {
    const renderMessage = useCallback(
        (data) => {
            const [messages_] = data

            const messages = messages_.map((item) => {
                const { id, resource_name = '', d, i, body, i2, created, lastMessage } = item

                let message

                switch (true) {
                    case resource_name.includes(":c"): {
                        message = (
                            <>
                                {[NEXT, LAST, NO_NEXT].includes(i2) &&
                                    body !== "" && (
                                        <div className="border-b pb-2 font-thin">
                                            {body}
                                        </div>
                                    )}
                                <span className="flex flex-row gap-2 mb-1">
                                    {
                                        {
                                            [LAST]: "Last contact",
                                            [NEXT]: "Next contact",
                                            [NEXT_ONLY]: (
                                                <span className="space-x-1">
                                                    <span>Next contact</span>
                                                    <i className="text-muted-foreground">
                                                        updated
                                                    </i>
                                                </span>
                                            ),
                                            [NO_NEXT]: (
                                                <span className="space-x-2">
                                                    <span>Next contact</span>
                                                    <span className="font-bold">
                                                        no date
                                                    </span>
                                                </span>
                                            ),
                                        }[i2]
                                    }
                                    {[NEXT, LAST, NEXT_ONLY].includes(i2) && (
                                        <span className="font-bold">
                                            {format(d, "d MMM yyy")}
                                        </span>
                                    )}
                                </span>
                                <ChatboxSentdate sentdate={created} />
                            </>
                        )
                        break
                    }
                    case !!lastMessage:
                        message = (
                            <ChatboxBizchatMessage 
                                chatId={lastMessage.chat_id}
                                created={lastMessage.sent}
                                type={lastMessage.type}
                                body={lastMessage.body}
                                from={lastMessage.from}
                            />
                        )
                        
                        break
                    case resource_name.includes(":bz"): { // remove later

                        message = (
                            <ChatboxBizchatMessage 
                                chatId={item.i}
                                created={item.created}
                                body={item.body}
                            />
                        )

                        break
                    }
                    default:
                        message = (
                            <>
                                <span className="font-thin mb-1">{body}</span>
                                <ChatboxSentdate sentdate={created} />
                            </>
                        )
                }

                return {
                    id,
                    message,
                }
            })

            return messages
        },
        []
    )

    return renderMessage
}

export default useRenderMessage
