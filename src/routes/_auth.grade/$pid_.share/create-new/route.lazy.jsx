import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import {
    createLazyFileRoute,
    Link,
    useNavigate,
    useRouterState,
} from "@tanstack/react-router"
import { useForm, useWatch } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { crmImport } from "@/services/bizchat"
import { useAuth } from "@/components/Auth/Auth-context"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useLayoutGradeContext } from "@/routes/_auth.grade"
import { Route as AuthGradePidShareConfirmImport } from '@/routes/_auth.grade/$pid_.share/confirm'
import { useGradeShareContext, useGradeShareFilterByEmailQuery, useGradeShareValidateEmailQuery } from "@/routes/_auth.grade/$pid_.share"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export const Route = createLazyFileRoute(
    "/_auth/grade/$pid/share/create-new"
)({
    component: AddClientComponent,
})

const schemaEmail = yup.string().email().required()
const schema = yup.object({
    first: yup.string().required(),
    email: schemaEmail
})

function AddClientComponent() {

    const { onConfirm } = useGradeShareContext()

    const auth = useAuth()

    const { defaultEmail = "" } = useRouterState({
        select: (state) => state.location.state,
    })

    const form = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            first: "",
            last: "",
            company: "",
            email: defaultEmail,
            phone: "",
        },
    })

    const importMutation = useMutation({
        mutationFn: (list) => crmImport(list, auth.authUserId)
    })

    const onSubmit = async values => {
        const { saved } =  await importMutation.mutateAsync([values])
        onConfirm({ id: saved[0], email: values.email })
    }

    const [validateEmailMessage, setValidateEmailMessage] = useState("")
    const [validateEmailShow, setValidateEmailShow] = useState(false)
    
    const [validateEmail, setValidateEmail] = useState("")

    const validateEmailQuery = useGradeShareValidateEmailQuery(validateEmail)

    useEffect(() => {

        const { isFetched, data } = validateEmailQuery

        if (isFetched) {

            let message = ""

            form.setError("email", {  message: "" })

            switch (true) {
                case data.already_sent && data.in_list:
                    message = "You shared this property already to this contact."
                    break
                case data.already_sent:
                    message = "Another agency shared this property to this contact"
                    break
                case data.in_list:
                    message = "This email is already is in used in your contacts"
                    break
                default:
                    message = "Email available"
            }
            
            setValidateEmailMessage(message)

        }


    }, [validateEmailQuery.data])

    const handleEmailBlur = () => {

        const email = form.getValues("email")

        if (!schemaEmail.isValidSync(email)) return
        
        setValidateEmail(email)
        setValidateEmailShow(true)

    }

    useEffect(() => {

        handleEmailBlur()

    }, [])

    const handleEmailFocus = () => {
        setValidateEmailShow(false)
    }

    return (
        <div className="flex flex-col gap-6">
            <Form {...form}>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                  
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-bold">Email*</FormLabel>
                              <FormControl>
                                  <Input {...field} onBlur={handleEmailBlur} onFocus={handleEmailFocus} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                        )}
                    />

                    {validateEmailQuery.isPending ? (
                        <Loader2 className="animate-spin" />
                    ) : validateEmailShow ? (
                        <div>
                            {validateEmailMessage}
                        </div>
                    ) : null}

                    <FormField
                        control={form.control}
                        name="first"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-sm font-bold">Full name</FormLabel>
                              <FormControl>
                                  <Input
                                      placeholder="First name*"
                                      {...field}
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                        )}
                    />

                    <Input placeholder="Last name" {...form.register("last")} />

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Company</label>
                        <Input {...form.register("company")} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Phone</label>
                        <Input {...form.register("phone")} />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link to="..">Change selection</Link>
                        </Button>
                        <Button type="submit">Next</Button>
                    </div>

                </form>
            </Form>
        </div>
    )
}
