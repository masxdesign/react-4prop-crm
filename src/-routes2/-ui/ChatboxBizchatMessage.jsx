import { Suspense, memo, useEffect, useMemo, useRef, useState } from "react"
import { CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { getBizchatMessagesLast5 } from "@/api/bizchat"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import ChatboxSentdate from "@/routes/-ui/ChatboxSentdate"
import { useAuth } from "@/components/Auth/Auth-context"
import ChatboxMessages from "./ChatboxMessages"
import { ReloadIcon } from "@radix-ui/react-icons"
import { PaperclipIcon } from "lucide-react"
import { reverse } from "lodash"

const BizchatMessage = memo(
    ({ body, chatId, senderUserId, bz_hash, created }) => {
        const ref = useRef()

        const [open, setOpen] = useState()
        const { teaser } = JSON.parse(body)
        const link = `/bizchat/rooms/${chatId}?i=${bz_hash}`

        useEffect(() => {

            if (open) {

                setTimeout(() => {
                    ref.current.scrollIntoView()
                }, 100)

            }

        }, [open])

        return (
            <>
                <span ref={ref} className="flex flex-col items-start gap-2 mb-2">
                    <span className="text-muted-foreground text-xs">
                        Bizchat message
                    </span>
                    {!open && <span className="font-bold min-w-[180px]">{teaser}</span>}
                    <Collapsible open={open} onOpenChange={setOpen}>
                        <CollapsibleContent>
                            <Suspense fallback={<p>Loading...</p>}>
                                <LoadBizchatMessagesLast5
                                    senderUserId={senderUserId}
                                    chatId={chatId}
                                />
                            </Suspense>
                        </CollapsibleContent>
                        <CollapsibleTrigger asChild>
                            <Button variant="secondary">
                                {open ? 'hide' : 'view'} last 5 messages
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                    <Button variant="link" size="sm" className="w-full" asChild>
                        <a
                            target="_blank"
                            className="flex bg-green-600 hover:bg-green-500 text-white items-center gap-2"
                            href={link}
                        >
                            View all messages
                        </a>
                    </Button>
                </span>
                <ChatboxSentdate sentdate={created} />
            </>
        )
    }
)

const ChatboxBizchatMessage = ({ message }) => {
    const auth = useAuth()
    const { id, resource_name, d, i, body, i2, created } = message
    return (
        <BizchatMessage
            body={body}
            chatId={i}
            senderUserId={auth.user.neg_id}
            bz_hash={auth.user.bz_hash}
            created={created}
        />
    )
}

function LoadBizchatMessagesLast5({ senderUserId, chatId }) {
    const { data, refetch } = useSuspenseQuery({
        queryKey: ["bizchatMessagesLast5", senderUserId, chatId],
        queryFn: () => getBizchatMessagesLast5({ senderUserId, chatId }),
        staleTime: Infinity,
    })

    const messages = useMemo(() => {
        return reverse(data.map(({ id, body, from, recipients, sent, type }) => {
            return {
                id, 
                message: (
                    <>
                        {(
                            {
                                'A': (
                                    <span className="flex flex-row gap-2">
                                        <PaperclipIcon className="w-4 h-4" /> Attachment
                                    </span>
                                ) 
                            }
                            [type] ?? body
                        )}
                        <ChatboxSentdate sentdate={sent} />
                    </>
                ), 
                variant: from === senderUserId ? 'sender' : 'recipient',
                size: 'sm'
            }
        }))
    }, [data])

    return (
        <div className="flex flex-col items-start gap-2">
            <Button variant="ghost" size="xs" className="space-x-3" onClick={refetch}>
                <ReloadIcon />
                <span>refresh</span>
            </Button>
            <ChatboxMessages autoScroll data={messages} className="w-[300px] max-h-[300px]" />
        </div>
    )
}

export default ChatboxBizchatMessage
