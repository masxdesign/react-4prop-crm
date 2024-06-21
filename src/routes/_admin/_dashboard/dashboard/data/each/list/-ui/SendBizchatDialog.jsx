import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Ddd from "./Ddd"
import Dd from "./Dd"
import { cva } from "class-variance-authority"
import { CheckCircle2Icon, History, Loader2, Loader2Icon, LucideCheck, Pause, Percent, Send } from "lucide-react"
import ProgressCircle from "@/routes/-ui/ProgressCircle"
import { Badge } from "@/components/ui/badge"
import { ResumeIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { Suspense, useEffect } from "react"
import Nl2br from "@/components/Nl2br/Nl2br"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import TooltipContentPrimary from "@/components/ui/TooltipContentPrimary"
import { Input } from "@/components/ui/input"
import { isEmpty } from "lodash"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import UserCard from "./UserCard"

function SendBizchatDialog({ selected, model, fetchNegotiatorsDataQueryOptions }) {
    const {
        open,
        paused,
        isPausing,
        items,
        subjectLine,
        message,
        currItem,
        onPause,
        onResume,
        lastItemPending,
        onAddItem,
        onSubjectLineChange,
        onMessageChange,
        onItemSelect,
        onOpenChange,
        onCancel
    } = model

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

    const handleSubmit = form.handleSubmit((data) => {
        setValue("subjectLine", "")
        setValue("message", "")
        onAddItem(data)
        toast({
            title: "Completed",
            description: "All message sent!",
        })
    })

    const handleResetMessageText = () => {
        setValue("message", "")
    }

    const handleReuseMessage = ({ body, subjectLine = "" }) => {
        setValue("subjectLine", subjectLine)
        setValue("message", body)
        onItemSelect(null)
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] overflow-y-scroll max-h-screen">
                <DialogHeader></DialogHeader>
                {lastItemPending && !isPausing && !paused && (
                    <div className="text-sm border-green-800 border text-green-800 px-3 py-2 shadow-md rounded">
                        Your messages are now being sent. <br/>
                        DO NOT CLOSE CRM TILL ALL MESSAGES ARE SENT<br/> 
                        you can use CRM or another program as long as CRM is OPEN
                    </div>
                )}
                <div className="flex gap-8">
                    <div className="flex flex-col justify-start gap-3 flex-grow-0 flex-shrink-1 basis-72">
                        {!lastItemPending && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className={cn(
                                    currItem 
                                        ? "hover:ring-1 hover:ring-inset hover:ring-black"
                                        : "ring-1 ring-inset ring-black"
                                )}
                                onClick={() => onItemSelect(null)}
                            >
                                Send a New message
                            </Button>
                        )}
                        <div className="flex flex-col gap-3 max-h-96">
                            {lastItemPending && (
                                <>
                                    <div className="flex justify-start gap-4 px-2">
                                        <span className="flex items-center text-sm opacity-70 mr-auto">
                                            {paused ? (
                                                <Pause className="h-4 w-4 mr-2" />
                                            ) : (
                                                <Loader2Icon className="animate-spin h-4 w-4 mr-2" />
                                            )}
                                            {isPausing ? (
                                                <span className="animate-pulse">Pausing...</span>
                                            ) : (
                                                <>
                                                    <span>{lastItemPending.progress}</span>
                                                    <Percent className="h-3 w-3" />
                                                </>
                                            )}
                                        </span>
                                        {!isPausing && (
                                            paused ? (
                                                <div
                                                    className="flex space-x-1 bg-transparent text-slate-600 items-center text-sm cursor-pointer" 
                                                    onClick={onResume}
                                                >
                                                    <ResumeIcon className="h-4 w-4" /><span>Resume</span>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex space-x-1 bg-transparent text-slate-600 items-center text-sm cursor-pointer"
                                                    onClick={onPause}
                                                >
                                                    <Pause className="h-4 w-4" /><span>Pause</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <Item 
                                        onItemSelect={onItemSelect}
                                        active={currItem?.id === lastItemPending.id}
                                        paused={paused}
                                        {...lastItemPending}
                                    />
                                    <div className="h-1"/>                                    
                                </>
                            )}
                            <h4 className="space-x-2 opacity-50 text-sm flex items-center">
                                <History className="w-4 h-4 inline-flex" /><span>{items.length} previous messages</span>
                            </h4>
                            <div className="space-y-3 overflow-y-auto">
                                {items.filter((item) => item !== lastItemPending).map(
                                    (item) => (
                                        <Item 
                                            key={item.id} 
                                            onItemSelect={onItemSelect} 
                                            active={currItem?.id === item.id}
                                            {...item} 
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                    {currItem ? (
                        <div className="flex flex-col flex-auto gap-4">
                            <div className="flex flex-row justify-between">
                                <div className="space-y-4">
                                    <Dd label="Created" value={format(
                                        currItem.created,
                                        "HH:mm dd/MM/yy"
                                    )} />                                    
                                    <PopoverCurrItemList
                                        currItem={currItem} 
                                        makeQueryOptions={fetchNegotiatorsDataQueryOptions}
                                    />
                                    <Dd label="Status" className="capitalize" value={lastItemPending === currItem ? (
                                        paused ? <Badge variant="secondary">Paused</Badge>
                                        : isPausing ? <Badge variant="secondary">Pausing...</Badge>
                                        : currItem.status === "pending" ? <Badge variant="secondary">Sending...</Badge>
                                        : <Badge variant="secondary">{currItem.status}</Badge>
                                    ) : (
                                        <Badge variant="secondary">{currItem.status}</Badge>
                                    )} />
                                </div>
                                {currItem.progress < 100 && (
                                    <ProgressCircle 
                                        perc={currItem.progress} 
                                        size="lg" 
                                        circleClassName={cn(
                                            ["cancelled"].includes(currItem.status) ? "text-red-500"
                                                : paused || isPausing || ["canceling"].includes(currItem.status)
                                                 ? "text-amber-500"  
                                                    : "text-green-500"
                                        )}
                                    />
                                )}
                            </div>
                            <Dd label="Subject line" disableTruncate value={
                                isEmpty(currItem.subjectLine) 
                                    ? <i className="opacity-50">(empty)</i>
                                    : currItem.subjectLine
                            } />
                            <div className="p-3 rounded-sm border text-sm min-h-32 max-h-96 overflow-y-auto">
                                <Nl2br text={currItem.body} />
                            </div>
                            <div className="flex flex-row gap-3 justify-end">
                                {!["completed", "canceling", "cancelled"].includes(currItem.status) && (
                                    <Button 
                                        variant="link"
                                        className="text-red-500" 
                                        onClick={() => onCancel(currItem.id)}
                                    >
                                        Cancel send-out
                                    </Button>
                                )}
                                {["completed", "cancelled"].includes(currItem.status) && (
                                    <Button 
                                        className="font-bold" 
                                        onClick={() => handleReuseMessage(currItem)}
                                        disabled={lastItemPending}
                                    >
                                        Reuse
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form 
                            onSubmit={handleSubmit} 
                            className="flex flex-col gap-4 flex-auto max-w-[520px]"
                        >
                            <div>
                                <h2 className="font-bold">Send a Mailshot via BizChat</h2>
                                <p>
                                    {selected.length > 0  ? (
                                        <span className="text-slate-500">
                                            You have selected <PopoverRecipientButton recipients={selected} makeQueryOptions={fetchNegotiatorsDataQueryOptions}>{selected.length} recipients</PopoverRecipientButton> for your mailing list
                                        </span>
                                    ) : (
                                        <span className="text-red-500">
                                            close box to select recipients for mailing, your message is saved
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <Input 
                                    placeholder="Type your subject line here.." 
                                    maxLength={60}
                                    {...register("subjectLine", { required: true })} 
                                />
                                <div className="opacity-50 text-xs text-right px-2">max. 60 characters</div>
                            </div>
                            <Textarea
                                placeholder="Type your message here..."
                                className="focus-visible:ring-inset focus-visible:ring-offset-0"
                                rows={18}
                                {...register("message", { required: true })}
                            />
                            <div className="space-x-3 text-right">
                                {watch('message') !== "" && (
                                    <Button
                                        variant="outline"
                                        onClick={handleResetMessageText}
                                        className="place-self-end font-bold"
                                    >
                                        Clear
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={selected.length < 1 || !formState.isValid}
                                    className="place-self-end font-bold"
                                >
                                    Send Bizchat
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function PopoverRecipientButton ({ children, recipients, renderItemIsSent, headerComponent, makeQueryOptions }) {
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
                        renderItemIsSent={renderItemIsSent}
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
                    renderItemIsSent={(item) => currItem.sent.includes(item.id)}
                >
                    {currItem.recipients.length} recipients <span className="ml-1 opacity-50">view</span>
                </PopoverRecipientButton>
            } 
        />
    )
}

function RecipientList ({ recipients, makeQueryOptions, renderItemIsSent }) {
    const { data } = useSuspenseQuery(makeQueryOptions(recipients))

    return data.map(item => 
        <UserCard
            key={item.id}
            data={item}
            className="w-full p-3 hover:bg-muted/50 cursor-pointer"
            isSent={renderItemIsSent?.(item)}
            hideView
            hideContact
        />
    )
}

SendBizchatDialog.Button = ({ selected, model }) => {
    const { onOpenChange, lastItemPending, paused } = model
    
    return (
        lastItemPending ? (
            <span className="text-sm space-x-1 p-1">
                <span className="opacity-50">
                    Please {paused ? 'resume' : 'wait'} / cancel last bizchat message to send another message. 
                </span>
                <span className="cursor-pointer underline" onClick={() => onOpenChange(true)}>
                    View message
                </span>
            </span>
        ) : (
            <Button
                variant="link"
                onClick={() => onOpenChange(true)}
            >
                Send Bizchat to {selected.length} agents
            </Button>
        )
    )
}

const ButtonSm = ({ onOpenChange, lastItemPending, className, icon: Icon, iconClassName, ...props }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                onClick={() => onOpenChange(true)}
                className={cn("h-8 gap-2", className)}
                {...props}
            >
                <Icon className={cn("h-4 w-4", iconClassName)} /> 
                <span>mailshot</span>
                {lastItemPending && (
                    <span>{lastItemPending.progress}%</span>
                )}
            </Button>
        </TooltipTrigger>
        <TooltipContentPrimary>
            send a message via BizChat
        </TooltipContentPrimary>
    </Tooltip>
)

SendBizchatDialog.ButtonSm = ({ model }) => {
    const { onOpenChange, lastItemPending, paused } = model

    return (
        lastItemPending ? (
            <ButtonSm 
                variant="link" 
                className={cn(
                    paused 
                        ? "text-amber-600 bg-amber-100"
                        : "text-green-600 bg-green-100"
                )}
                icon={paused ? Pause: Loader2Icon}
                iconClassName={cn({ "animate-spin": !paused })}
                lastItemPending={lastItemPending}
                onOpenChange={onOpenChange}
            />
        ) : (
            <ButtonSm 
                variant="link"
                icon={Send}
                onOpenChange={onOpenChange}
            />
        )
    )
}

const itemCva = cva(
    "flex flex-col gap-0 p-3 rounded-md cursor-pointer",
    {
        variants: {
            intent: {
                pending: "bg-green-100 hover:ring-1 hover:ring-inset hover:ring-green-500",
                pending_active: "ring-1 ring-inset ring-green-500 bg-green-100",
                completed: "bg-slate-100 hover:ring-1 hover:ring-inset hover:ring-black",
                completed_active: "ring-1 ring-inset ring-black bg-slate-100",
                paused: "bg-amber-100 hover:ring-1 hover:ring-inset hover:ring-amber-500 text-amber-500",
                paused_active: "ring-1 ring-inset ring-amber-500 bg-amber-100 text-amber-500",
                canceling: "bg-amber-100 hover:ring-1 hover:ring-inset hover:ring-amber-500 text-amber-500",
                canceling_active: "ring-1 ring-inset ring-amber-500 bg-amber-100 text-amber-500",
                cancelled: "bg-red-100 hover:ring-1 hover:ring-inset hover:ring-red-500 text-red-500",
                cancelled_active: "ring-1 ring-inset ring-red-500 bg-red-100 text-red-500"
            }
        }
    }
)

function Item ({ id, body, created, sent, recipients, progress, className, status, active, onItemSelect, paused }) {
    
    return (
        <p
            onClick={() => onItemSelect(id)}
            className={itemCva({ intent: `${paused ? "paused" : status}${active ? '_active': ''}`, className })}
        >
            <span className="truncate max-w-72">{body}</span>
            <span className="flex justify-end text-sm">
                <span className="opacity-50">
                    {format(
                        created,
                        "d MMM yyy"
                        )}
                </span>                
            </span>
        </p>
    )
}

export default SendBizchatDialog
