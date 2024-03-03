import { useMutation } from "@tanstack/react-query"
import { updateClient } from "@/api/api-fakeServer"
import Form from "../Form/Form"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import Clientform from "./Clientform"

const ClientFormEdit = ({ focusOn, defaultValues, tab, onSelect, onSubmit }) => {

    const mutation = useMutation({
        mutationFn: (data) => updateClient({ id: data.id }, data)
    })

    const handleSubmit = async (data) => {
        try {
            await mutation.mutateAsync(data)
            onSubmit(data)
        } catch (e) {
            console.log(e);
        }
    }

    const submitButton = (
        <div className="flex justify-end">
            <Form.Submit disabled={mutation.isPending}>
                {mutation.isPending ? (
                    'Saving...'
                ) : (
                    'Save'
                )}
            </Form.Submit> 
        </div>
    )

    return (
        <Clientform 
            focusOn={focusOn} 
            defaultValues={defaultValues} 
            onSubmit={handleSubmit} 
            className="space-y-8"
        >
            <Form.Accordion 
                type="single" 
                value={tab} 
                onValueChange={onSelect} 
                collapsible
            >
                <AccordionItem value="person">
                    <AccordionTrigger>
                        Personal details
                    </AccordionTrigger>
                    <AccordionContent className="px-1 space-y-8">
                        <Clientform.PersonalDetails />                        
                        {submitButton}      
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="contact">
                    <AccordionTrigger>
                        Contact
                    </AccordionTrigger>
                    <AccordionContent className="px-1 space-y-8">
                        <Clientform.ContactDetails />                        
                        {submitButton}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="address">
                    <AccordionTrigger>
                        Address
                    </AccordionTrigger>
                    <AccordionContent className="px-1 space-y-8">
                        <Clientform.Address />                        
                        {submitButton}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="categories">
                    <AccordionTrigger>
                        Categories
                    </AccordionTrigger>
                    <AccordionContent className="px-1 space-y-8">
                        <Clientform.Categories />                        
                        {submitButton}
                    </AccordionContent>
                </AccordionItem>
            </Form.Accordion>
        </Clientform>
    )
}

export default ClientFormEdit