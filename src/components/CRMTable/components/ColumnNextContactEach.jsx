import { addNextContact } from "@/api/fourProp"
import ColumnNextContact from "@/routes/-ui/ColumnNextContact"
import { useContactDateEachMutationOptions } from "@/components/CRMTable/hooks"
import { useAuth } from "@/components/Auth/Auth-context"

const ColumnNextContactEach = ({
    id, 
    tableDataQueryKey = null,
    placeholder = "Pick a date",
    name = "next_contact",
    table = null,
    defaultValue = null,
    onSuccess, 
    message,
}) => {
    const auth = useAuth()
    const mutationOptions = useContactDateEachMutationOptions({
        id,
        tableDataQueryKey,
        mutationFn: addNextContact,
        onSuccess,
    })

    if (auth.user?.neg_id === id) return null

    return (
        <ColumnNextContact
            name={name}
            id={id}
            table={table}
            defaultValue={defaultValue}
            message={message}
            placeholder={placeholder}
            mutationOptions={mutationOptions}
        />
    )
}

export default ColumnNextContactEach
