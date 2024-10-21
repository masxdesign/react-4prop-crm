import {
    Dialog,
    DialogContent,
    DialogHeader
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Dd from "./Dd"
import { cx } from "class-variance-authority"
import { FilesIcon, History, LucideTextSelection, PaperclipIcon, RefreshCcwDot, RefreshCwIcon, RefreshCwOff, Send, SendHorizonalIcon, SendIcon, User2, UserIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { Suspense, useEffect, useMemo, useState } from "react"
import Nl2br from "@/components/Nl2br/Nl2br"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import TooltipContentPrimary from "@/components/ui/TooltipContentPrimary"
import { Input } from "@/components/ui/input"
import _ from "lodash"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import useSendBizchatDialog from "./use-SendBizchatDialog"
import BizchatAttachmentsButton from "@/routes/--ui/BizchatAttachmentsButton"
import Attachment from "@/routes/--ui/Attachment"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

const NewMessageForm = ({ uppy, form, onSubmit, onResetMessageText, isPending, recipients, selected }) => {
    return (
        <form 
            onSubmit={onSubmit} 
            className="flex flex-col gap-2 flex-auto bg-white shadow-sm p-3 relative"
        >
            {isPending && (
                <div className="absolute inset-0 p-3 bg-white/80 z-10 flex justify-center items-center">
                    <div className="flex flex-col items-center p-3 gap-4">
                        <div className="animate-bounce flex justify-center items-center bg-sky-100 rounded-full w-20 h-20 shadow-lg">
                            <SendIcon className="w-10 h-10 text-sky-800" />
                        </div>
                        <span className="text-lg text-center">
                            Hold tight your message is <br/>being sent to {recipients.length} recipients
                        </span>
                    </div>
                </div>
            )}
            <h2 className="font-bold text-lg">New message</h2>
            <div className="flex gap-2">
                <Input 
                    placeholder="Type your subject line here..." 
                    className="text-base"
                    maxLength={60}
                    {...form.register("subjectLine", { required: true })} 
                />
                <BizchatAttachmentsButton uppy={uppy} size="sm" />
            </div>
            <Textarea
                placeholder="Type your message here..."
                className="focus-visible:ring-inset focus-visible:ring-offset-0 text-base"
                rows={20}
                {...form.register("message", { required: true })}
            />
            <div className="space-x-3 text-right">
                {form.watch('message') !== "" && (
                    <Button
                        variant="link"
                        size="sm"
                        onClick={onResetMessageText}
                        className="place-self-end"
                    >
                        Clear
                    </Button>
                )}
                <Button
                    type="submit"
                    size="sm"
                    disabled={selected.length < 1 || !form.formState.isValid}
                    className="place-self-end"
                >
                    Send
                </Button>
            </div>
        </form>
    )
}

function SendBizchatDialog({ selected, model, tableSSModal, makeFetchNegQueryOptions }) {
    const {
        open,
        onOpenChange
    } = model
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1200px] overflow-y-scroll max-h-screen">
                <DialogHeader></DialogHeader>
                <DialogContentBody 
                    model={model} 
                    tableSSModal={tableSSModal}
                    selected={selected} 
                    makeFetchNegQueryOptions={makeFetchNegQueryOptions} 
                />
            </DialogContent>
        </Dialog>
    )
}

function DialogContentBody ({ model, tableSSModal, selected, makeFetchNegQueryOptions }) {
    const {
        sendRequest,
        message,
        subjectLine,
        onAddItem,
        uppy,
        onMessageChange,
        onSubjectLineChange,
        onItemSelect,
        notEmailedQueryOptions,
        onRefreshList
    } = model

    const {
        query,
        statQuery,
        data,
        currItem,
        recipients
    } = useSendBizchatDialog.use.query({ model, selected })

    const form = useForm({
        defaultValues: { 
            subjectLine,
            message 
        }
    })

    const { toast } = useToast()
    
    useEffect(() => {
        const subscription = form.watch((value) => {
            onSubjectLineChange(value.subjectLine)
            onMessageChange(value.message)
        })
        return () => subscription.unsubscribe()
    }, [form.watch])

    const handleResetMessageText = () => {
        form.setValue("subjectLine", "")
        form.setValue("message", "")
        uppy.clear()
    }

    const handleSubmit = form.handleSubmit((data) => {
        handleResetMessageText()
        onAddItem(data)
        toast({
            title: "Completed",
            description: "Message sent!",
        })
    })

    const handleReuseMessage = ({ message, subjectLine = "" }) => {
        form.setValue("subjectLine", subjectLine)
        form.setValue("message", message)
        onItemSelect(null)
    }

    const handleReuseRecipients = (recipients) => {
        tableSSModal.selectMany(recipients)
        onItemSelect(null)
    }

    return (
        <div className="flex gap-5">
            <div className="flex flex-col gap-3">
                <h4 className="flex items-center gap-2">
                    {data.length > 0 ? (
                        <span className="mr-auto">{data.length} campaigns</span>
                    ) : (
                        <span className="mr-auto">No campaigns</span>
                    )}
                    {currItem && (
                        <Button
                            size="xs"
                            onClick={() => onItemSelect(null)}
                            disabled={sendRequest.isPending}
                            className="relative space-x-2"
                        >
                            <span>
                                + new
                            </span>
                            <span className="flex items-center gap-0">
                                <UserIcon className="w-3 h-3" />
                                <span className="text-xs font-normal">{selected.length}</span>
                            </span>
                        </Button>
                    )}
                    <Button 
                        variant="link" 
                        size="xs" 
                        onClick={onRefreshList} 
                        disabled={statQuery.isFetching}
                    >
                        <RefreshCwIcon className="w-4 h-4" />
                    </Button>
                </h4>
                <div className="space-y-2 w-64 max-h-[600px] overflow-auto pb-3">
                    {data.length > 0 ? (
                        data.map((item) => (
                            <Campaign 
                                key={item.id} 
                                onItemSelect={onItemSelect} 
                                active={currItem?.id === item.id}
                                className="w-64"
                                {...item} 
                            />
                        ))
                    ) : (
                        <div className="flex justify-center font-bold text-muted-foreground/50 h-60">
                            <LucideTextSelection className="w-20 h-20 m-auto" />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex grow p-3 bg-slate-50 gap-3">
                <div className="space-y-2">
                    <span className="space-x-3">
                        <span>
                            <span className="font-semibold">Recipients</span>  {recipients.length}
                        </span>
                        {currItem && (
                            <span 
                                className="cursor-pointer hover:underline text-xs text-muted-foreground"
                                onClick={() => handleReuseRecipients(recipients)}
                            >
                                Reuse
                            </span>
                        )}
                    </span>
                    {currItem ? (
                        <p className="text-xs text-muted-foreground">Click recipient to reply</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">Close box to select recipients</p>
                    )}
                    <div className="w-64 max-h-[580px] overflow-auto space-y-1 pb-3">
                    {recipients.length > 0 ? (
                        <Suspense fallback={<p>loading...</p>}>
                            {currItem ? (
                                <RecipientList 
                                    campaign={currItem}
                                    recipients={recipients} 
                                    makeQueryOptions={makeFetchNegQueryOptions} 
                                    notEmailedQueryOptions={notEmailedQueryOptions}
                                />
                            ) : (
                                <FetchRecipientListUsers 
                                    recipients={recipients} 
                                    makeQueryOptions={makeFetchNegQueryOptions} 
                                />
                            )}  
                        </Suspense>
                    ) : (
                        <p className="text-red-500 text-sm">
                            No recipients
                        </p>
                    )}
                    </div>
                </div>
                <div className="bg-white h-[636px] shadow-sm grow">
                    {currItem ? (
                        <div className="flex py-3 flex-col gap-2 h-[636px] overflow-hidden">
                            <h1 className="px-3 font-bold text-lg">{currItem.subjectLine}</h1>
                            <article className="px-3 grow overflow-auto">
                                <Nl2br text={currItem.message} />
                            </article>
                            {currItem.attachments.length > 0 && (
                                <div className="px-3 flex justify-center">
                                    <HoverCard openDelay={100} closeDelay={100}>
                                        <HoverCardTrigger asChild>
                                            <span className="inline-flex items-center flex-row gap-2 cursor-pointer py-2 px-3 bg-sky-50 text-sky-700 rounded hover:underline hover:bg-sky-100">
                                                <PaperclipIcon className="w-4 h-4" />
                                                <span className="text-sm">{currItem.attachments.length} attachment(s)</span>
                                            </span>
                                        </HoverCardTrigger>
                                        <HoverCardContent side="top" align="center" className="space-y-2">
                                            {currItem.attachments.map(({ name, url, fileType, fileSize }) => {
                                                return (
                                                    <Attachment 
                                                        key={url}
                                                        name={name}
                                                        url={url}
                                                        fileType={fileType}
                                                        fileSize={fileSize}
                                                    />
                                                )
                                            })}
                                        </HoverCardContent>
                                    </HoverCard>    
                                </div>                            
                            )}
                            <div className="flex items-center justify-between px-3">
                                <small className="text-nowrap space-x-2"> 
                                    {currItem.justSent && (
                                        <span className="text-slate-800">Just sent</span>
                                    )} 
                                    <span className="text-muted-foreground text-[11px]">
                                        {format(
                                            currItem.created,
                                            "d MMM yyyy HH:mm"
                                        )}
                                    </span>                                  
                                </small>
                                <Button 
                                    variant="secondary"
                                    size="xs"
                                    className="font-bold" 
                                    onClick={() => handleReuseMessage(currItem)}
                                >
                                    Reuse
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <NewMessageForm 
                            uppy={uppy}
                            recipients={recipients}
                            form={form}
                            isPending={sendRequest.isPending}
                            onSubmit={handleSubmit}
                            selected={selected}
                            onResetMessageText={handleResetMessageText}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

function RecipientList ({ campaign, notEmailedQueryOptions, ...props }) {
    const { data } = useSuspenseQuery(notEmailedQueryOptions)

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <FetchRecipientListUsers 
                campaign={campaign} 
                notEmailed={data}
                {...props}
            />
        </Suspense>
    )
}
function FetchRecipientListUsers ({ recipients, makeQueryOptions, campaign = null, notEmailed = null }) {
    const query = useSuspenseQuery(makeQueryOptions(recipients))

    const data = useMemo(() => {
        return query.data.map(item => {
            const stat = campaign?.statOfRecipients[item.id]
            const unread_total = stat?.unread_total ?? 0
            const chat_id = stat?.chat_id

            const handleClick = () => {
                if (!campaign) return
                window.open(`https://4prop.com/bizchat/rooms/${chat_id}?message=${campaign.id},crm`, "bizchat")
            }

            return {
                ...item,
                unread_total,
                chat_id,
                notEmailed: notEmailed?.includes(item.id),
                handleClick
            }
        })
    }, [query.data, campaign, notEmailed])

    return data.map(item => {
        return (
            <div 
                key={item.id} 
                onClick={item.handleClick}
                className='space-y-1 w-full p-2 bg-white hover:shadow-md cursor-pointer shadow-sm text-xs'
            >
                <span className="flex justify-between">
                    <span className="font-semibold">
                        {item.first} {item.last}
                    </span>
                    {campaign && (
                        <span className="text-muted-foreground">
                            {item.notEmailed ? (
                                <span className="opacity-50">enqueue</span>
                            ) : (
                                <span className="opacity-50">sent</span>                        
                            )}
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-1">
                    <div className='text-nowrap truncate text-muted-foreground grow font-thin'>{item.company}</div>
                    {item.unread_total > 0 && (
                        <span className="flex items-center gap-1 text-white bg-green-600 px-1 rounded-sm shadow-sm text-xs">
                            <span className="font-bold">{item.unread_total}</span>
                        </span>
                    )}
                </div>
            </div>
        )
    })
}

SendBizchatDialog.Button = ({ selected, model }) => {
    const { onOpenChange } = model
    
    return (
        <Button
            variant="link"
            onClick={() => onOpenChange(true)}
        >
            Send Bizchat to {selected.length} agents
        </Button>
    )
}

const ButtonSm = ({ onOpenChange, className, icon: Icon, iconClassName, ...props }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                onClick={() => onOpenChange(true)}
                className={cn("h-8 gap-2", className)}
                {...props}
            >
                <Icon className={cn("h-4 w-4", iconClassName)} /> 
                <span>Mass bizchat</span>
            </Button>
        </TooltipTrigger>
        <TooltipContentPrimary>
            send a message via BizChat
        </TooltipContentPrimary>
    </Tooltip>
)

SendBizchatDialog.ButtonSm = ({ model }) => {
    const { onOpenChange } = model

    return (
        <ButtonSm 
            variant="link"
            icon={Send}
            onOpenChange={onOpenChange}
        />
    )
}

function Campaign ({ id, stat, subjectLine, created, recipients, attachments, active, justSent, onItemSelect, className }) {
    
    return (
        <div className={cx(
            className, 
            "flex flex-col p-3  border rounded-sm cursor-pointer hover:shadow-md gap-1", 
            active ? 'border-sky-400 bg-sky-50 shadow-sm': 'border-transparent bg-slate-50'
        )} onClick={() => onItemSelect(id)}>
            <span className="truncate font-semibold text-sm">{subjectLine}</span>
            <span className="flex text-sm gap-3">
                <span className="text-xs">
                    {justSent ? (
                        <span className="opacity-50">Just sent</span>
                    ) : (
                        <span className="opacity-50">
                            {format(created, "d MMM yyyy HH:mm")}
                        </span>
                    )}
                </span>                
                <span className="flex items-center text-xs gap-1">
                    <UserIcon className="w-3 h-3"/> 
                    <span className="font-thin">{recipients.length}</span>
                </span>
                {attachments.length > 0 && (
                    <span className="flex items-center text-xs gap-1">
                        <PaperclipIcon className="w-3 h-3"/> 
                        <span className="font-thin">{attachments.length}</span>
                    </span>
                )}
                <span className="flex items-center text-xs gap-4 ml-auto">
                    {stat?.unread_total > 0 && (
                        <span className="flex items-center gap-1 text-white bg-green-600 px-1 rounded-sm shadow-sm">
                            <span className="font-bold">{stat?.unread_total}</span>
                        </span>
                    )}
                </span>
            </span>
        </div>
    )
}

export default SendBizchatDialog
