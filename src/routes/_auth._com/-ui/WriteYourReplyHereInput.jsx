import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/Auth/Auth"
import { replyBizchatEnquiryMessage } from "@/services/bizchat"
import { selectReplyTo, useMessagesLastNList } from "./hooks"
import WriteYourReplyHereInputForm from "./WriteYourReplyHereInputForm"

const WriteYourReplyHereInput = ({ chat_id, property }) => {
    const auth = useAuth()
    const queryClient = useQueryClient()
    const replyTo = useMessagesLastNList(auth.bzUserId, chat_id, (state) => selectReplyTo(state, auth.bzUserId))

    const sendReply = useMutation({
        mutationFn: (variables) => 
            replyBizchatEnquiryMessage({ 
                chat_id, 
                from: auth.bzUserId, 
                recipients: replyTo, 
                message: variables.message,
                attachments: variables.files,
                property
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: ["bizchatMessagesLastN", auth.bzUserId, chat_id] 
            })
        }
    })
    
    const handleSubmit = (values) => sendReply.mutateAsync(values)
    
    return (
        <WriteYourReplyHereInputForm 
            onSubmit={handleSubmit} 
        />
    )
}


export default WriteYourReplyHereInput