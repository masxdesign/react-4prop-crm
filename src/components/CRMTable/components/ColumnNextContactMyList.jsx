import { crmAddNextContact } from "@/services/bizchat"
import useContactDateMyListMutationOptions from "../hooks/use-ContactDateMyListMutationOptions"
import ColumnNextContact from "./ColumnNextContact"

const ColumnNextContactMyList = ({
    importId, 
    authUserId,
    placeholder = "Pick a date",
    name = "next_contact",
    table = null,
    defaultValue = null,
    tableDataQueryKey = null,
    onSuccess, 
    message
}) => {
    const mutationOptions = useContactDateMyListMutationOptions({
        importId,
        tableDataQueryKey,
        mutationFn: variables => crmAddNextContact(variables, importId, authUserId),
        onSuccess,
        authUserId
    })

    return (
        <ColumnNextContact
            name={name}
            id={importId}
            table={table}
            defaultValue={defaultValue}
            message={message}
            placeholder={placeholder}
            mutationOptions={mutationOptions}
        />
    )
}

export default ColumnNextContactMyList
