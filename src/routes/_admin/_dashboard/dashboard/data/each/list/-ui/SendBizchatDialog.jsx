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
import { History, Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { Suspense, useEffect, useMemo } from "react"
import Nl2br from "@/components/Nl2br/Nl2br"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import TooltipContentPrimary from "@/components/ui/TooltipContentPrimary"
import { Input } from "@/components/ui/input"
import { find, isEmpty } from "lodash"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import UserCard from "./UserCard"

function SendBizchatDialog({ selected, model, makeFetchNegQueryOptions }) {
    const {
        open,
        onOpenChange
    } = model
    
    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
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

    const currItem = useMemo(
        () => find(query.data, { id: currItemId }),
        [query.data, currItemId]
    )

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

    const handleReuseMessage = ({ message, subjectLine = "" }) => {
        setValue("subjectLine", subjectLine)
        setValue("message", message)
        onItemSelect(null)
    }

    return (
        <div className="flex gap-5">
            <div className="flex flex-col justify-start gap-3 flex-grow-0 flex-shrink-1 basis-72">
                <div className="flex flex-col gap-3">
                    <h4 className="flex items-center gap-2">
                        <span className="mr-auto">{query.data.length} campaigns</span>
                        <Button
                            variant="default"
                            size="xs"
                            onClick={() => onItemSelect(null)}
                            disabled={sendRequest.isPending}
                        >
                            new
                        </Button>
                    </h4>
                    
                    <div className="space-y-3 max-h-[600px] overflow-auto">
                        {query.data.map(
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
            <div className="flex grow p-3 bg-slate-50 gap-5">
                <div className="w-64 space-y-3">
                    <b>Recipients</b>
                    <div className="max-h-[600px] overflow-auto space-y-2">
                        <Suspense fallback={<p>loading...</p>}>
                            <RecipientList 
                                recipients={currItem?.recipients ?? selected} 
                                makeQueryOptions={makeFetchNegQueryOptions} 
                            />
                        </Suspense>
                    </div>
                </div>
                <div className="bg-white shadow-sm grow p-3">
                    {currItem ? (
                        <div className="flex flex-col flex-auto gap-4">
                            <h1 className="font-bold text-lg">{currItem.subjectLine}</h1>
                            <p><Nl2br text={currItem.message} /></p>
                            {/* <div className="flex flex-row justify-between">
                                <div className="space-y-4">
                                    <Dd label="Created" value={format(
                                        currItem.created,
                                        "HH:mm dd/MM/yy"
                                    )} />                                    
                                    <PopoverCurrItemList
                                        currItem={currItem} 
                                        makeQueryOptions={makeFetchNegQueryOptions}
                                    />
                                </div>
                            </div>
                            <Dd label="Subject line" disableTruncate value={
                                isEmpty(currItem.subjectLine) 
                                    ? <i className="opacity-50">(empty)</i>
                                    : currItem.subjectLine
                            } />
                            <div className="p-3 rounded-sm border text-sm min-h-32 max-h-96 overflow-y-auto">
                                <Nl2br text={currItem.message} />
                            </div> */}
                            <div className="flex flex-row gap-3 justify-end">
                                <Button 
                                    className="font-bold" 
                                    onClick={() => handleReuseMessage(currItem)}
                                >
                                    Reuse
                                </Button>
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
                                        <span className="text-slate-500 space-x-2">
                                            <span>You have selected</span>
                                            <PopoverRecipientButton 
                                                recipients={selected} 
                                                makeQueryOptions={makeFetchNegQueryOptions}
                                            >
                                                {selected.length} recipients
                                            </PopoverRecipientButton>
                                            <span>for your mailing list</span>
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

function RecipientList ({ recipients, makeQueryOptions }) {
    const { data } = useSuspenseQuery(makeQueryOptions(recipients))

    return data.map(item => 
        <UserCard
            key={item.id}
            data={item}
            className="w-full p-3 bg-white hover:bg-muted/50 cursor-pointer shadow-sm"
            hideView
            hideContact
        />
    )
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

function Item ({ id, message, subjectLine, created, sent, recipients, progress, className, status, active, onItemSelect, paused }) {
    
    return (
        <p className={cx("p-3 bg-slate-50 rounded-sm", { 'shadow-md': active })} onClick={() => onItemSelect(id)}>
            <span className="truncate max-w-72 font-semibold text-sm">{subjectLine}</span>
            <span className="flex justify-end text-sm">
                <span className="opacity-50 text-xs">
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
