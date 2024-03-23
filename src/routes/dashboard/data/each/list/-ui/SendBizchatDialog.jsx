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

const itemCva = cva(
    "flex flex-col gap-4 p-3 rounded-md cursor-pointer",
    {
        variants: {
            intent: {
                pending: "bg-green-100 hover:ring-1 hover:ring-inset hover:ring-green-500",
                completed: "bg-slate-100 hover:ring-1 hover:ring-inset hover:ring-black",
                pending_active: "ring-1 ring-inset ring-green-500 bg-green-100",
                completed_active: "ring-1 ring-inset ring-black bg-slate-100"
            }
        }
    }
)

function SendBizchatDialog({
    open,
    pause,
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
    onReuseMessage
}) {
    
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
                                    <Dd label="Status" value={<Badge variant="secondary">{currItem.status}</Badge>} />
                                </div>
                                {currItem.progress < 100 && (
                                    <ProgressCircle 
                                        perc={currItem.progress} 
                                        size="lg" 
                                    />
                                )}
                                {currItem.pausing && <span>Pausing...</span>}
                                {pause && <Pause />}
                            </div>
                            <div className="p-3 rounded-sm border min-h-32">
                                {currItem.body}
                            </div>
                            <div className="flex flex-row gap-3 justify-end">
                                <Button 
                                    variant="secondary"
                                    className="font-bold space-x-1" 
                                    onClick={onPause}
                                >
                                    <Pause className="h-4 w-4" /><span>Pause</span>
                                </Button>
                                <Button 
                                    variant="secondary"
                                    className="font-bold space-x-1" 
                                    onClick={onResume}
                                >
                                    <ResumeIcon className="h-4 w-4" /><span>Resume</span>
                                </Button>
                                <Button 
                                    className="font-bold" 
                                    onClick={() => onReuseMessage(currItem.body)}
                                >
                                    Reuse
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 flex-auto">
                            {lastItemPending && <p>Message is sending...</p>}
                            <Dd label="Recipients" value={(
                                recipients.length > 0 
                                    ? recipients.length
                                    : (
                                        <>
                                            Select your recipients
                                        </>
                                    )
                            )} />
                            <Textarea
                                placeholder="Type your message here."
                                className="focus-visible:ring-inset focus-visible:ring-offset-0"
                                value={message}
                                onChange={onMessageChange}
                            />
                            <Button
                                onClick={() => onAddItem(message)}
                                disabled={recipients.length < 1}
                                className="place-self-end font-bold"
                            >
                                Send Bizchat
                            </Button>
                        </div>
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

function Item ({ id, body, created, sent, recipients, progress, className, status, active, onItemSelect }) {
    
    return (
        <p
            onClick={() => onItemSelect(id)}
            className={itemCva({ intent: `${status}${active ? '_active': ''}`, className })}
        >
            <span className="truncate">{body}</span>
            <span className="flex justify-between text-sm">
                {progress < 100 && (
                    <span className="flex items-center gap-1">
                        <span>{progress}</span><Percent className="h-3 w-3" />
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
