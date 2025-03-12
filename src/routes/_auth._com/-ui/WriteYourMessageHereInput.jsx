import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/components/Auth/Auth"
import { sendBizchatPropertyEnquiry } from "@/services/bizchat"
import WriteYourReplyHereInputForm from "./WriteYourReplyHereInputForm"

const WriteYourMessageHereInput = ({ property, onSuccess }) => {
    const auth = useAuth()

    const sendMessage = useMutation({
        mutationFn: async (variables) => {
            const message = await sendBizchatPropertyEnquiry({
                from: auth.bzUserId, 
                recipients: property.agents,
                message: variables.message,
                property,
                choices: variables.choices,
                applicant_uid: null
            })

            return {
                ...message,
                _property: property
            }
        },
        onSuccess
    })

    return (
        <WriteYourReplyHereInputForm
            disableChoices={auth.isAgent}
            placeholder="Write your message here..." 
            onSubmit={sendMessage.mutateAsync} 
        />
    )
}

export default WriteYourMessageHereInput