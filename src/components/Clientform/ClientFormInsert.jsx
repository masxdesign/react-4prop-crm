import { useMutation } from "@tanstack/react-query"
import Form from "../Form/Form"
import Clientform from "./Clientform"
import { addClient } from "@/api/api-fakeServer"

const ClientFormInsert = ({ defaultValues, onSubmit }) => {
    const mutation = useMutation({
        mutationFn: addClient
    })

    const handleSubmit = async (data) => {
        try {
            await mutation.mutateAsync(data)
            onSubmit(data)
        } catch (e) {
            console.log(e);
        }
    }
  
    return (
      <Clientform defaultValues={defaultValues} onSubmit={handleSubmit} className="space-y-8">
        <Clientform.PersonalDetails header="Personal" />  
        <Clientform.ContactDetails header="Contact" />    
        <Clientform.Address header="Address" />      
        <Clientform.Categories header="Categories" />  
        <Form.Submit>Save</Form.Submit> 
      </Clientform>
    )
}

export default ClientFormInsert