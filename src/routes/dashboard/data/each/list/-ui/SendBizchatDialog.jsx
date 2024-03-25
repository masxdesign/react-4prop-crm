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
import { Pause, Percent, Send } from "lucide-react"
import ProgressCircle from "@/routes/dashboard/-ui/ProgressCircle"
import { Badge } from "@/components/ui/badge"
import { ResumeIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { useEffect } from "react"

function SendBizchatDialog({
    open,
    paused,
    isPausing,
    items,
    message,
    currItem,
    recipients,
    onPause,
    onResume,
    lastItemPending,
    onAddItem,
    onMessageChange,
    onItemSelect,
    onOpenChange,
    onCancel
}) {

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {
            isDirty,
            isValid
        }
    } = useForm({
        defaultValues: { message }
    })
    
    useEffect(() => {
        const subscription = watch((value) => onMessageChange(value.message))
        return () => subscription.unsubscribe()
    }, [watch])

    const handleReuseMessage = (body) => {
        setValue("message", body)
        onItemSelect(null)
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Send Bizchat</DialogTitle>
                </DialogHeader>
                <div className="flex gap-4">
                    <div className="flex flex-col justify-start gap-3 flex-grow-0 flex-shrink-1 basis-72">
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
                            New message
                        </Button>
                        <div className="flex flex-col gap-3 h-80">
                            {lastItemPending && (
                                <Item 
                                    onItemSelect={onItemSelect}
                                    active={currItem?.id === lastItemPending.id}
                                    paused={paused}
                                    {...lastItemPending}
                                />
                            )}
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
                                    <Dd label="Sent" value={currItem.sent.length} />
                                    <Dd label="Recipients" value={currItem.recipients.length} />
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
                            <div className="p-3 rounded-sm border min-h-32">
                                {currItem.body}
                            </div>
                            <div className="flex flex-row gap-3 justify-end">
                                {!["completed", "canceling", "cancelled"].includes(currItem.status) && (
                                    <>
                                        {paused ? (
                                            <Button 
                                                variant="link"
                                                className="font-bold space-x-1 bg-transparent text-slate-600" 
                                                onClick={onResume}
                                            >
                                                <ResumeIcon className="h-4 w-4" /><span>Resume</span>
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="link"
                                                className={cn("font-bold space-x-1 bg-transparent text-slate-600", { "animate-pulse": isPausing })} 
                                                onClick={onPause}
                                            >
                                                <Pause className="h-4 w-4" /><span>{isPausing ? "Pausing..." : "Pause"}</span>
                                            </Button>
                                        )}
                                        <Button 
                                            variant="link"
                                            className="opacity-50" 
                                            onClick={() => onCancel(currItem.id)}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                                <Button 
                                    className="font-bold" 
                                    onClick={() => handleReuseMessage(currItem.body)}
                                >
                                    Reuse
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form 
                            onSubmit={handleSubmit((data) => onAddItem(data.message))} 
                            className="flex flex-col gap-3 flex-auto"
                        >
                            <Dd label="Recipients" value={(
                                recipients.length > 0 
                                    ? recipients.length
                                    : (
                                        <span className="opacity-50">
                                            select your recipients
                                        </span>
                                    )
                            )} />
                            <Textarea
                                placeholder="Type your message here."
                                className="focus-visible:ring-inset focus-visible:ring-offset-0"
                                {...register("message", { required: true })}
                            />
                            <Button
                                type="submit"
                                disabled={recipients.length < 1 || !isValid}
                                className="place-self-end font-bold"
                            >
                                Send Bizchat
                            </Button>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

SendBizchatDialog.Button = ({ selected, onOpenChange, ...props }) => (
    <Button
        onClick={() => onOpenChange(true)}
        {...props}
    >
        Send Bizchat to {selected.length} agents
    </Button>
)

SendBizchatDialog.ButtonSm = ({ onOpenChange, lastItemPending, className, ...props }) => (
    <Button
        onClick={() => onOpenChange(true)}
        className={cn("h-8 gap-2", className)}
        {...props}
    >
        <Send className="h-4 w-4" /> 
        <span>Bizchat</span>
        {lastItemPending && (
            <span>{lastItemPending.progress}%</span>
        )}
    </Button>
)

const itemCva = cva(
    "flex flex-col gap-4 p-3 rounded-md cursor-pointer",
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
            <span className="truncate ring-am">{body}</span>
            <span className="flex justify-between text-sm">
                {progress < 100 && (
                    <span className="flex items-center">
                        <span>{progress}</span><Percent className="h-3 w-3" />
                        {paused && <Pause className="h-4 w-4" />}
                    </span>
                )}
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
