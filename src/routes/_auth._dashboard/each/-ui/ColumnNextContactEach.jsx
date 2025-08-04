import { addNextContact } from "@/services/fourProp"
import { useAuth } from "@/components/Auth/Auth"
import useContactDateMutationOptions from "./use-ContactDateEachMutationOptions"
import ColumnNextContact from "@/components/CRMTable/components/ColumnNextContact"

const ColumnNextContactEach = ({
    id, 
    tableDataQueryKey = null,
    placeholder = "Pick a date",
    name = "next_contact",
    table = null,
    defaultValue = null,
    onSuccess, 
    message,
    portalled
}) => {
    const auth = useAuth()
    const mutationOptions = useContactDateMutationOptions({
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
            portalled={portalled}
        />
    )
}

export default ColumnNextContactEach
