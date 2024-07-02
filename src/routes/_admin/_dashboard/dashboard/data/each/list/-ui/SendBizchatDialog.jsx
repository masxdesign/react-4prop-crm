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
import { History, Send, User2, UserIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { Suspense, useEffect, useMemo } from "react"
import Nl2br from "@/components/Nl2br/Nl2br"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import TooltipContentPrimary from "@/components/ui/TooltipContentPrimary"
import { Input } from "@/components/ui/input"
import _, { find, isEmpty } from "lodash"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import UserCard from "./UserCard"
import { getMassBizchatStat } from "@/api/bizchat"
import { EnvelopeClosedIcon } from "@radix-ui/react-icons"

function SendBizchatDialog({ selected, model, makeFetchNegQueryOptions }) {
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
                    selected={selected} 
                    makeFetchNegQueryOptions={makeFetchNegQueryOptions} 
                />
            </DialogContent>
        </Dialog>
    )
}

function DialogContentBody ({ model, selected, makeFetchNegQueryOptions }) {
    const {
        listQueryOptions,
        statQueryOptions,
        sendRequest,
        message,
        subjectLine,
        currItemId,
        onAddItem,
        onMessageChange,
        onSubjectLineChange,
        onItemSelect
    } = model

    const query = useQuery(listQueryOptions)
    const statQuery = useQuery(statQueryOptions)

    const {
        register,
        watch,
        setValue,getValues,
        formState,
        ...form
    } = useForm({
        defaultValues: { 
            subjectLine,
            message 
        }
    })

    const { toast } = useToast()
    
    useEffect(() => {
        const subscription = watch((value) => {
            onSubjectLineChange(value.subjectLine)
            onMessageChange(value.message)
        })
        return () => subscription.unsubscribe()
    }, [watch])

    const data = useMemo(() => {
        return query.data.map(item => {
            const stat = _.find(statQuery.data, { crm_id: item.id })

            return {
                ...item,
                recipients: _.map(stat?.recipients, 'recipient'),
                statOfRecipients: Object.fromEntries(stat?.recipients.map(item => ([item.recipient, item])) ?? []),
                stat
            }
        })
    }, [query.data, statQuery.data])

    const currItem = useMemo(
        () => find(data, { id: currItemId }),
        [data, currItemId]
    )

    const recipients = currItem?.recipients ?? selected

    const handleResetMessageText = () => {
        setValue("subjectLine", "")
        setValue("message", "")
    }

    const handleSubmit = form.handleSubmit((data) => {
        handleResetMessageText()
        onAddItem(data)
        toast({
            title: "Completed",
            description: "All message sent!",
        })
    })

    const handleReuseMessage = ({ message, subjectLine = "" }) => {
        setValue("subjectLine", subjectLine)
        setValue("message", message)
        onItemSelect(null)
    }

    return (
        <div className="flex gap-5">
            <div className="flex flex-col gap-3">
                <h4 className="flex items-center gap-2">
                    <span className="mr-auto">{data.length} campaigns</span>
                    <Button
                        variant="default"
                        size="xs"
                        onClick={() => onItemSelect(null)}
                        disabled={sendRequest.isPending}
                    >
                        + new
                    </Button>
                </h4>
                <div className="space-y-2 w-64 max-h-[600px] overflow-auto">
                    {data.map(
                        (item) => (
                            <Campaign 
                                key={item.id} 
                                onItemSelect={onItemSelect} 
                                active={currItem?.id === item.id}
                                className="w-64"
                                {...item} 
                            />
                        )
                    )}
                </div>
            </div>
            <div className="flex grow p-3 bg-slate-50 gap-5">
                <div className="space-y-3">
                    <b>Recipients {recipients.length}</b>
                    <div className="w-64 max-h-[600px] overflow-auto space-y-2">
                    {recipients.length > 0 ? (
                            <Suspense fallback={<p>loading...</p>}>
                                <RecipientList 
                                    recipients={recipients} 
                                    statOfRecipients={currItem?.statOfRecipients}
                                    makeQueryOptions={makeFetchNegQueryOptions} 
                                />
                            </Suspense>
                    ) : (
                        <span className="text-red-500">
                            close box to select recipients for mailing, your message is saved
                        </span>
                    )}
                    </div>
                </div>
                <div className="bg-white h-[636px] shadow-sm grow">
                    {currItem ? (
                        <div className="flex flex-col h-[636px] overflow-hidden">
                            <div className="flex p-3 shadow-sm items-center gap-3">
                                <h1 className="font-bold text-xl">{currItem.subjectLine}</h1>
                            </div>
                            <article className="p-3 grow overflow-auto">
                                <Nl2br text={currItem.message} />
                            </article>
                            <div className="flex items-end justify-between p-3">
                                <Button 
                                    variant="secondary"
                                    size="sm"
                                    className="font-bold" 
                                    onClick={() => handleReuseMessage(currItem)}
                                >
                                    Reuse
                                </Button>
                                <small className="text-muted-foreground text-nowrap">                                    
                                    {format(
                                            currItem.created,
                                            "d MMM yyyy HH:mm"
                                        )}
                                </small>
                            </div>
                        </div>
                    ) : (
                        <form 
                            onSubmit={handleSubmit} 
                            className="flex flex-col gap-2 flex-auto bg-white shadow-sm p-3"
                        >
                            <h2 className="font-normal">Send a Mailshot via BizChat</h2>
                            <Input 
                                placeholder="Type your subject line here..." 
                                className="text-base"
                                maxLength={60}
                                {...register("subjectLine", { required: true })} 
                            />
                            <Textarea
                                placeholder="Type your message here..."
                                className="focus-visible:ring-inset focus-visible:ring-offset-0 text-base"
                                rows={20}
                                {...register("message", { required: true })}
                            />
                            <div className="space-x-3 text-right">
                                {watch('message') !== "" && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={handleResetMessageText}
                                        className="place-self-end"
                                    >
                                        Clear
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={selected.length < 1 || !formState.isValid}
                                    className="place-self-end"
                                >
                                    Send
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

function PopoverRecipientButton ({ children, recipients, headerComponent, makeQueryOptions }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="xs">
                    {children}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                {headerComponent && (
                    <div className="px-3 py-2 text-xs font-bold bg-sky-50 text-sky-600">
                        {headerComponent}
                    </div>
                )}
                <Suspense fallback={<p>loading...</p>}>
                    <RecipientList 
                        recipients={recipients} 
                        makeQueryOptions={makeQueryOptions} 
                    />
                </Suspense>
            </PopoverContent>
        </Popover>
    )
}

function PopoverCurrItemList ({ currItem, makeQueryOptions }) {
    return (
        <Dd 
            label="To" 
            value={
                <PopoverRecipientButton
                    recipients={currItem.recipients}
                    makeQueryOptions={makeQueryOptions}
                >
                    {currItem.recipients.length} recipients <span className="ml-1 opacity-50">view</span>
                </PopoverRecipientButton>
            } 
        />
    )
}

function RecipientList ({ recipients, statOfRecipients, makeQueryOptions }) {
    const { data } = useSuspenseQuery(makeQueryOptions(recipients))

    return data.map(item => {
        const unread_total = statOfRecipients?.[item.id]?.unread_total

        return (
            <div key={item.id} className='space-y-1 w-full p-3 bg-white hover:bg-muted/50 cursor-pointer shadow-sm text-sm'>
                <b>{item.first} {item.last}</b>
                <div className="flex items-center gap-1">
                    <div className='text-nowrap truncate text-muted-foreground grow'>{item.company}</div>
                    {unread_total > 0 && (
                        <span className="flex items-center gap-1 text-white bg-green-500 px-1 rounded-sm shadow-sm text-xs">
                            <span className="font-bold">{statOfRecipients?.[item.id]?.unread_total}</span>
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
                <span>mailshot</span>
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

function Campaign ({ id, stat, subjectLine, created, recipients, active, onItemSelect, className }) {
    
    return (
        <div className={cx(className, "flex flex-col px-3 py-2 bg-slate-50 rounded-sm cursor-pointer hover:shadow-md", { 'shadow-md': active })} onClick={() => onItemSelect(id)}>
            <span className="truncate font-semibold text-sm">{subjectLine}</span>
            <span className="flex text-sm gap-3">
                <span className="opacity-50 text-xs">
                    {format(
                        created,
                        "d MMM yyyy HH:mm"
                        )}
                </span>                
                <span className="flex items-center text-xs gap-1">
                    <UserIcon className="w-3 h-3"/> 
                    <span className="font-thin">{recipients.length}</span>
                </span>
                <span className="flex items-center text-xs gap-4 ml-auto">
                    {stat?.unread_total > 0 && (
                        <span className="flex items-center gap-1 text-white bg-green-500 px-1 rounded-sm shadow-sm">
                            <span className="font-bold">{stat?.unread_total}</span>
                        </span>
                    )}
                </span>
            </span>
        </div>
    )
}

export default SendBizchatDialog
