import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/Auth/Auth"
import { replyBizchatEnquiryMessage } from "@/services/bizchat"
import { selectReplyTo, useMessagesLastNList } from "./hooks"
import WriteYourReplyHereInputForm from "./WriteYourReplyHereInputForm"

const WriteYourReplyHereInput = ({ chat_id, ownerNid, property }) => {
    const auth = useAuth()

    const from = ownerNid ?? auth.bzUserId

    const queryClient = useQueryClient()
    const replyTo = useMessagesLastNList(from, chat_id, (state) => selectReplyTo(state, from))

    const sendReply = useMutation({
        mutationFn: (variables) => {
            return replyBizchatEnquiryMessage({ 
                chat_id, 
                from, 
                recipients: replyTo, 
                message: variables.message,
                attachments: variables.files,
                choices: variables.choices,
                dteamNid: auth.user.neg_id === from.replace('N', '')
                    ? null
                    : auth.user.neg_id,
                property
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: ["bizchatMessagesLastN", from, chat_id] 
            })
        }
    })

    return (
        <WriteYourReplyHereInputForm 
            disableChoices={auth.isAgent}
            choicesDisableOptions={property.enquiry_choices} 
            onSubmit={sendReply.mutateAsync} 
        />
    )
}


export default WriteYourReplyHereInput