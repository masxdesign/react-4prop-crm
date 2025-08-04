import { addNextContact } from "@/services/fourProp"
import { useContactDateEachMutationOptions } from "@/components/CRMTable/hooks"
import { useAuth } from "@/components/Auth/Auth"
import ColumnNextContact from "./ColumnNextContact"

const ColumnNextContactEach = ({
    id, 
    placeholder = "Pick a date",
    name = "next_contact",
    table = null,
    defaultValue = null,
    tableDataQueryKey = null,
    onSuccess, 
    message,
    portalled
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
            ColumnNextContact
            portalled={portalled}
        />
    )
}

export default ColumnNextContactEach
