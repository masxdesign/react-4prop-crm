import { Suspense, memo, useEffect, useMemo, useRef, useState } from "react"
import { ExternalLinkIcon, PaperclipIcon } from "lucide-react"
import { cx } from "class-variance-authority"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { ReloadIcon } from "@radix-ui/react-icons"
import { reverse, truncate } from "lodash"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { useAuth } from "@/components/Auth/Auth"
import ChatboxSentdate from "./ChatboxSentdate"
import ChatboxMessages from "./ChatboxMessages"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { attachmentCombiner } from "@/components/Uppy/utils"
import { Attachment } from "@/components/Uppy/components"
import { bizchatMessagesLast5Query } from "@/features/messaging/messaging.queries"
import ReactMarkdown from "@/features/messaging/components/ReactMarkdown"

const messageCombiner = (type, body, from, chatId) => {
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

const BizchatMessagePreview = memo(({ type = 'M', body, chatId, from, className, itemClassName, showMessage }) => {
    const messageData = messageCombiner(type, body, from, chatId)

    return (
        <span className={cx("space-y-1", className)}>
            {showMessage && (
                <ReactMarkdown content={messageData.teaser} />
            )}
            {messageData.attachments?.length > 0 && (
                messageData.attachments.map(({ name, url, fileType, fileSize }) => {
                    return (
                        <Attachment 
                            key={url}
                            name={name}
                            url={url}
                            fileType={fileType}
                            fileSize={fileSize}
                            className={itemClassName}
                        />
                    )
                })
            )}
        </span>
    )
})

const BizchatMessage = ({ type = 'M', body, chatId, authUserId, bz_hash, created, from }) => {
    const ref = useRef()

    const [open, setOpen] = useState(false)
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
                {!open && (
                    <BizchatMessagePreview 
                        type={type} 
                        body={body} 
                        chatId={chatId} 
                        from={from} 
                        className="min-w-[180px]"
                        itemClassName="w-[250px]"
                        showMessage
                    />
                )}
                <Collapsible open={open} onOpenChange={setOpen} className="space-y-3">
                    <CollapsibleContent>
                        <Suspense fallback={<p>Loading...</p>}>
                            <LoadBizchatMessagesLast5
                                authUserId={authUserId}
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
                        View all messages <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                </Button>
            </span>
            <ChatboxSentdate sentdate={created} />
        </>
    )
}

const ChatboxBizchatMessage = ({ type = 'A', chatId, body, created, from }) => {
    const auth = useAuth()

    return (
        <BizchatMessage 
            body={body}
            type={type}
            chatId={chatId}
            from={from}
            authUserId={auth.user.neg_id}
            bz_hash={auth.user.bz_hash}
            created={created}
        />
    )
}

function LoadBizchatMessagesLast5 ({ authUserId, chatId }) {
    const { data, refetch } = useSuspenseQuery(bizchatMessagesLast5Query(authUserId, chatId))

    const messages = useMemo(() => {
        return reverse(data.map(({ id, body, from, recipients, sent, type, chat_id }) => {
            const messageData = messageCombiner(type, body, from, chat_id)

            const handleClick = () => {
                window.open(`https://4prop.com/bizchat/rooms/${chat_id}?message=${id}`, "bizchat")
            }

            const sideAlignOptions = from === authUserId 
                ? { side: "left", align: "center" }
                : { side: "right", align: "center" }

            return {
                id, 
                message: (
                    <>
                        <div className="relative space-y-2 mb-2">
                            {['A'].includes(type) && (
                                <HoverCard openDelay={100} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                        <span className="flex items-center flex-row gap-1 hover:underline">
                                            <PaperclipIcon className="w-3 h-3" />
                                            <span className="font-bold">{messageData.attachments.length} attachment(s)</span>
                                        </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent {...sideAlignOptions}>
                                        <BizchatMessagePreview 
                                            type={type} 
                                            body={body} 
                                            chatId={chatId} 
                                            from={from} 
                                            className="w-[150px]"
                                        />
                                    </HoverCardContent>
                                </HoverCard>
                            )}
                            <ReactMarkdown content={messageData.teaser} />
                            <div className="flex">
                                {messageData.teaser.length !== messageData.body.length && (
                                    <Button size="xs" variant="secondary" className="my-4 mx-auto" onClick={handleClick}>
                                        View full
                                    </Button>
                                )}
                            </div>
                        </div>
                        <ChatboxSentdate sentdate={sent} className="text-[10px]" />
                    </>
                ), 
                variant: from === authUserId ? 'sender' : 'recipient',
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
            <ChatboxMessages 
                autoScroll 
                data={messages} 
                className="w-[350px] max-h-[300px] bg-slate-50 rounded-lg" 
            />
        </div>
    )
}

export default ChatboxBizchatMessage
