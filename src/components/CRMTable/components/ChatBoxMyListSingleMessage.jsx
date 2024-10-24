import React from "react"
import { format } from "date-fns"
import { ChatboxSentdate } from "@/components/CRMTable/components"

const NEXT = 2
const NEXT_ONLY = 3
const NO_NEXT = 4

const LAST = 1
const MESSAGE_ONLY = 0

const ChatBoxMyListSingleMessage = React.memo(({ body, dt, id, import_id, ownerUid, type, created }) => {
    switch (true) {
        case ![MESSAGE_ONLY].includes(type) : {
            return (
                <>
                    {[NEXT, LAST, NO_NEXT].includes(type) &&
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
                            }[type]
                        }
                        {[NEXT, LAST, NEXT_ONLY].includes(type) && (
                            <span className="font-bold">
                                {format(dt, "d MMM yyy")}
                            </span>
                        )}
                    </span>
                    <ChatboxSentdate sentdate={created} />
                </>
            )
        }
        default:
            return (
                <>
                    <span className="font-thin mb-1">{body}</span>
                    <ChatboxSentdate sentdate={created} />
                </>
            )
    }
})

export default ChatBoxMyListSingleMessage