import { format } from "date-fns"
import { ExternalLinkIcon } from "lucide-react"
import { EnvelopeClosedIcon, EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { ChatboxBizchatMessage, ChatboxSentdate } from "@/components/CRMTable/components"
import { Dddl } from "@/components/DisplayData/components"
import { Button } from "@/components/ui/button"

const NEXT = "2"
const LAST = "1"
const NEXT_ONLY = "3"
const NO_NEXT = "4"

function messagesCombiner ([messages_]) {
    return messages_.map((item) => {
        return {
            id: item.id,
            message: messageCombiner(item)
        }
    })
}

function messageCombiner ({ resource_name = '', d, body, i2, created, lastMessage, mailshot }) {
    switch (true) {
        case resource_name.includes(":c"): {
            return (
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
        }
        case !!lastMessage:
            return (
                <ChatboxBizchatMessage 
                    chatId={lastMessage.chat_id}
                    created={lastMessage.sent}
                    type={lastMessage.type}
                    body={lastMessage.body}
                    from={lastMessage.from}
                />
            )
        case resource_name.includes(":bz"): { // remove later
            return (
                <ChatboxBizchatMessage 
                    chatId={item.i}
                    created={item.created}
                    body={item.body}
                />
            )
        }
        case !!mailshot:
            return (
                <div className="space-y-5 pb-4">
                    <span className="flex gap-2 text-muted-foreground text-xs">
                        {mailshot.openedDate 
                            ? <EnvelopeOpenIcon className="text-green-500" />
                            : <EnvelopeClosedIcon />
                        }
                        Mailshot
                    </span>   
                    <div className='text-sm space-y-2'>
                        <Dddl  
                            items={[
                                { label: "Campaign", name: "campaign_name", bold: true, className: "text-orange-600" },
                                { label: "Mail list", name: "maillist_name" },
                                { label: "Template", name: "template_name", bold: true },
                                { label: "Subject", name: "template_subject" },
                                { label: "Opened", name: "openedDate", isDate: true },
                                { label: "Email", name: "email" },
                            ]}
                            row={mailshot}
                        />
                    </div>   
                    <div className="text-center">
                        <Button asChild>   
                            <a href={mailshot.link} className="space-x-2 bg-orange-600 hover:bg-orange-500" target="__blank">
                                <span>View campaign</span>
                                <ExternalLinkIcon className="w-3 h-3" />
                            </a>
                        </Button>
                    </div>                          
                    <ChatboxSentdate sentdate={mailshot.date_sent} />
                </div>
            )
        default:
            return (
                <>
                    <span className="font-thin mb-1">{body}</span>
                    <ChatboxSentdate sentdate={created} />
                </>
            )
    }
}

export default messagesCombiner
