import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

function SendBizchatDialog({ 
    open,
    items,
    message,
    currItem,
    recipients,
    lastItemPending,
    onAddItem,
    onMessageChange,
    onItemSelect,
    onOpenChange
}) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Send Bizchat</DialogTitle>
                </DialogHeader>
                <div className="flex gap-4">
                    <div className="w-1/2 flex flex-col gap-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onItemSelect(null)}
                        >
                            New message
                        </Button>
                        {items.map(({ id, created, body, recipients, sent }) => (
                            <p key={id} onClick={() => onItemSelect(id)} className="flex flex-col gap-4 p-3 bg-slate-100 rounded-md">
                                <span className="truncate">{body}</span>
                                <span className="flex justify-between text-sm">
                                    <span>{sent.length}/{recipients.length}</span>
                                    <span className="opacity-50">{format(created, "HH:mm:ss d MMM yyy")}</span>
                                </span>
                            </p>
                        ))}
                    </div>
                    {currItem ? (
                        <div className="w-1/2">
                            {JSON.stringify(currItem)}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 basis-1/2">
                            {lastItemPending && <p>Message is sending...</p>}
                            <Textarea
                                placeholder="Type your message here."
                                className="focus-visible:ring-inset focus-visible:ring-offset-0 resize-none"
                                value={message}
                                onChange={onMessageChange}
                            />
                            {recipients.length > 0 ? (
                                <span>
                                    Send to {recipients.length} recipients
                                </span>
                            ) : (
                                <span>
                                    To send this message you need to select 1 or more recipients
                                </span>
                            )}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onAddItem(message)}
                                disabled={recipients.length < 1}
                            >
                                Send
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

SendBizchatDialog.Button = ({ selected, onOpenChange, ...props }) => (
    <Button onClick={() => onOpenChange(true)} disabled={selected.length < 1} {...props}>
        Send Bizchat to {selected.length} agents
    </Button>
)

export default SendBizchatDialog
