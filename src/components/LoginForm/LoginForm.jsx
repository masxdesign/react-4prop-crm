import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { Form } from "../ui/form"
import { Button } from "../ui/button"
import UIFormFieldLabel from "../UIFormFieldLabel/UIFormFieldLabel"
import { useAuthStore } from "@/store"
import { useMutation } from "@tanstack/react-query"

const schema = yup.object({
    email: yup.string().required(),
    password: yup.string().required()
})

const defaultValues = {
    email: "",
    password: ""
}

const LoginForm = ({ onSuccess }) => {
    const login = useAuthStore.use.login()

    const form = useForm({ 
        resolver: yupResolver(schema),
        defaultValues
    })

    const { formState: { errors } } = form

    const { mutate, isPending } = useMutation({
        mutationFn: login,
        onSuccess,
        onError: (e) => {
            form.setError("root", {
                type: "server",
                message: e.message
            })
        }
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(mutate)} className="space-y-2">
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