import { useQuery } from "@tanstack/react-query"
import * as Yup from "yup"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import categoriesQueryOptions from "@/api/categoriesQueryOptions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { ClientformContext, useClientformContext } from "./context"
import { Accordion } from "../ui/accordion"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"

const schema = Yup.object().shape({
    first: Yup.string().required(),
    email: Yup.string().required(),
})

const Clientform = ({ children, defaultValues, onSubmit, ...props }) => {
    const form = useForm({
        resolver: yupResolver(schema),
        defaultValues
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
                <ClientformContext.Provider value={{ form }}>
                    {children}
                </ClientformContext.Provider>
            </form>
        </Form>
    )

}

Clientform.Accordion = ({ onValueChange, ...props }) => {
    const { form } = useClientformContext()

    const handleValueChange = (...args) => {
        onValueChange(...args)
        form.reset()
    }

    return (
        <Accordion onValueChange={handleValueChange} {...props} />
    )
}

Clientform.PersonalDetails = () => {
    const { form } = useClientformContext()

    return (
        <>
            <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                            <Input placeholder="Your company" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Salutation</FormLabel>
                        <FormControl>
                            <Input placeholder="Your title" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="first"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="last"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}

Clientform.ContactDetails = () => {
    const { form } = useClientformContext()

    return (
        <>
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />     
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                            <Input placeholder="Your phone" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />     
        </>
    )
}

Clientform.Address = () => {
    const { form } = useClientformContext()

    return (
        <>
            <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                            <Input placeholder="Your city" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Postcode</FormLabel>
                        <FormControl>
                            <Input placeholder="Your postcode" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />     
        </>
    )
}

Clientform.Categories = () => {
    const query = useQuery(categoriesQueryOptions) 
    const categories = query.data

    const { form } = useClientformContext()

    if(query.isLoading) return <p>Loading...</p>

    return (
        <FormField
            control={form.control}
            name="categories"
            render={() => (
                <FormItem>
                    {categories.map((item) => (
                        <FormField
                            key={item.value}
                            control={form.control}
                            name="categories"
                            render={({ field }) => {
                                return (
                                    <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(item.value)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...field.value, item.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                    (value) => value !== item.value
                                                )
                                                )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {item.label}
                                    </FormLabel>
                                    </FormItem>
                                )
                            }}
                        />
                    ))}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

Clientform.Submit = ({ children, disabled }) => {
    const { form } = useClientformContext()

    return (
        <Button type="submit" disabled={!form.formState.isDirty || disabled}>
            {children}    
        </Button> 
    )
}

export default Clientform