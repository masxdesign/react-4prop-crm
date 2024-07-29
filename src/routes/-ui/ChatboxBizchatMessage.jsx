import { Suspense, memo, useEffect, useMemo, useRef, useState } from "react"
import { CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { getBizchatMessagesLast5 } from "@/api/bizchat"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import ChatboxSentdate from "@/routes/-ui/ChatboxSentdate"
import { useAuth } from "@/components/Auth/Auth-context"
import ChatboxMessages from "./ChatboxMessages"
import { ImageIcon, ReloadIcon } from "@radix-ui/react-icons"
import { PaperclipIcon } from "lucide-react"
import { isString, reverse, truncate } from "lodash"
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm"
import { defaultStyles, FileIcon } from "react-file-icon"

const LinkRender = ({ className, ...props }) => {
    return <a {...props} className={cn("underline", className)} target="_blank" rel="noreferrer" />
}

const BizchatMessage = memo(
    ({ type = 'M', body, chatId, senderUserId, bz_hash, created, from }) => {
        const ref = useRef()

        const [open, setOpen] = useState()
        const link = `/bizchat/rooms/${chatId}?i=${bz_hash}`

        const messageData = useMemo(() => {
            if (type === 'A') {
                const data = JSON.parse(body)
                const [messageStr, ...attachments] = data
                return {
                    teaser: truncate(messageStr, { length: 200 }),
                    attachments: attachments.map(([filename, renamed, fileType]) => {
                        return {
                            filename,
                            name: `${filename}.${fileType}`,
                            url: `${from}_${chatId}_${renamed}.${fileType}`,
                            fileType
                        }
                    })
                }
            }

            return {
                teaser: truncate(body, { length: 200 })
            }

        }, [type, body]) 

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
                        <span className="space-y-1 min-w-[180px]">
                            <ReactMarkdown 
                                components={{
                                    a: LinkRender
                                }}
                                children={messageData.teaser} 
                                remarkPlugins={[remarkGfm]}                                     
                            />
                            {messageData.attachments?.length > 0 && (
                                messageData.attachments.map(({ name, url, fileType }) => {
                                    return (
                                        <a 
                                            key={url} 
                                            href={`https://localhost:8081/${url}`}
                                            target="__blank"
                                            className="flex gap-3 p-1 border rounded text-xs w-[250px]"
                                        >
                                            <div className="w-7 max-h-10 overflow-hidden">
                                                {['jpg', 'jpeg', 'gif', 'png'].includes(fileType) ? (
                                                    <img src={`https://localhost:8081/p_${url}`} className="max-w-full" />
                                                ) : (
                                                    <FileIcon extension={fileType} {...defaultStyles[fileType]} />
                                                )}
                                            </div>
                                            <span className=" w-3/4 grow">
                                                {name}
                                            </span>
                                        </a>
                                    )
                                })
                            )}
                        </span>
                    )}
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

const ChatboxBizchatMessage = ({ type = 'A', chatId, body, created, recipients, from }) => {
    const auth = useAuth()

    return (
        <BizchatMessage
            body={body}
            type={type}
            chatId={chatId}
            from={from}
            senderUserId={auth.user.neg_id}
            bz_hash={auth.user.bz_hash}
            created={created}
        />
    )
}

function LoadBizchatMessagesLast5 ({ senderUserId, chatId }) {
    const { data, refetch } = useSuspenseQuery({
        queryKey: ["bizchatMessagesLast5", senderUserId, chatId],
        queryFn: () => getBizchatMessagesLast5({ senderUserId, chatId }),
        staleTime: Infinity,
    })

    const messages = useMemo(() => {
        return reverse(data.map(({ id, body, from, recipients, sent, type, chat_id }) => {
            const teaser = truncate(body, { length: 200 })
            const handleClick = () => {
                window.open(`https://4prop.com/bizchat/rooms/${chat_id}?message=${id}`, "bizchat")
            }

            return {
                id, 
                message: (
                    <div onClick={handleClick}>
                        {(
                            {
                                'A': (
                                    <span className="flex flex-row gap-2">
                                        <PaperclipIcon className="w-4 h-4" /> Attachment
                                    </span>
                                ) 
                            }
                            [type] ?? (
                                <ReactMarkdown 
                                    components={{
                                        a: LinkRender
                                    }}
                                    children={teaser} 
                                    remarkPlugins={[remarkGfm]}                                     
                                />
                            )
                        )}
                        <div className="flex">
                            {teaser.length !== body.length && (
                                <Button size="xs" variant="secondary" className="my-4 mx-auto">
                                    View full
                                </Button>
                            )}
                        </div>
                        <ChatboxSentdate sentdate={sent} />
                    </div>
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
