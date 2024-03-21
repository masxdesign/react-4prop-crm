import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import useSendBizchatButton from "./use-SendBizchatButton"

export default function SendBizchatButton({ selected, ...props }) {
    const {
        open,
        newMessage,
        currMessage,
        messages,
        onMessageSelect,
        onCreateMessage,
        onMessageChange,
        onNewMessageChange,
        onOpenChange,
    } = useSendBizchatButton({ selected })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button {...props} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Send Bizchat</DialogTitle>
                </DialogHeader>
                <div className="flex">
                    <div className="basis-1/2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onMessageSelect(null)}
                        >
                            New message
                        </Button>
                        {messages.map(({ id }) => (
                            <p key={id} onClick={() => onMessageSelect(id)}>
                                {id}
                            </p>
                        ))}
                    </div>
                    {currMessage ? (
                        <div>
                            <Textarea
                                placeholder="Type your message here."
                                className="focus-visible:ring-inset focus-visible:ring-offset-0 resize-none"
                                value={currMessage.body}
                                onChange={onMessageChange}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Textarea
                                placeholder="Type your message here."
                                className="focus-visible:ring-inset focus-visible:ring-offset-0 resize-none"
                                value={newMessage}
                                onChange={onNewMessageChange}
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    onCreateMessage(selected, newMessage)
                                }
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

/*
    const remaining = selected.filter((item) => !sent.includes(item.id))

    const { isPending, mutateAsync, ...d } = useMutation({
        mutationFn: async (selected) => {
            try {
                await delay(3000)
                console.log(selected)
            } catch (e) {
                return
            }
        },
    })

    console.log(d)

    const handleSend = async () => {
        for (const item of remaining) {
            await mutateAsync(item)
            onSent((prev) => [...prev, item.id])
        }
    }

*/
