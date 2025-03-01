import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/components/Auth/Auth"
import { sendBizchatPropertyEnquiry } from "@/services/bizchat"
import WriteYourReplyHereInputForm from "./WriteYourReplyHereInputForm"

const WriteYourMessageHereInput = ({ property, onSuccess }) => {
    const auth = useAuth()

    const sendMessage = useMutation({
        mutationFn: sendBizchatPropertyEnquiry,
        onSuccess
    })

    const handleSubmit = (values) => sendMessage.mutateAsync({
        from: auth.bzUserId, 
        recipients: property.agents,
        message: values.message,
        property,
        choices: {
            pdf: false,
            viewing: false
        },
        applicant_uid: null
    })

    return (
        <WriteYourReplyHereInputForm
            placeholder="Write your message here..." 
            onSubmit={handleSubmit} 
        />
    )
}

export default WriteYourMessageHereInput