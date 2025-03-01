import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { Form } from "../ui/form"
import { Button } from "../ui/button"
import UIFormFieldLabel from "../UIFormFieldLabel/UIFormFieldLabel"

const schema = yup.object({
    email: yup.string().required(),
    password: yup.string().required()
})

const defaultValues = {
    email: "",
    password: ""
}

const LoginForm = ({ defaultEmail, onSubmit, isPending, ...props }) => {
    const form = useForm({ 
        resolver: yupResolver(schema),
        defaultValues: {
            ...defaultValues,
            email: defaultEmail ?? defaultValues.email
        },
        errors: props.errors
    })

    const { formState: { errors } } = form

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                {errors.root && (
                    <p>{errors.root.message}</p>
                )}
                <UIFormFieldLabel 
                    form={form} 
                    name="email" 
                    label="Email" 
                    placeholder="Email"
                />
                <UIFormFieldLabel 
                    form={form} 
                    name="password" 
                    inputType="password"
                    label="Password" 
                    placeholder="Password"
                />
                <Button type="submit" className="w-full">
                    {isPending ? 'Pending...': 'Login'}
                </Button>
            </form>
        </Form>
    )
}

export default LoginForm