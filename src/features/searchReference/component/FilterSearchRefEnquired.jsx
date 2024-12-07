import { useAuth } from "@/components/Auth/Auth-context"
import { useSuspenseQuery } from "@tanstack/react-query"
import { searchReferenceListingEnquiredQuery } from "../searchReference.queries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FilterSearchRefEnquired({ value = null, onValueChange }) {
    const auth = useAuth()

    const { data } = useSuspenseQuery(searchReferenceListingEnquiredQuery(auth.authUserId)) 

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-8 w-[180px] text-left">
                <SelectValue placeholder={<span className="text-muted-foreground">Filter by search reference</span>} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={null}>All</SelectItem>
                <SelectItem value="NULL">Unnamed</SelectItem>
                {data.map(row => (
                    <SelectItem 
                        key={row.id} 
                        value={row.id}
                        disabled={row.count < 1}
                    >
                        {row.name} {row.count > 0 && <span className="rounded bg-sky-100 px-2 ml-2">{row.count}</span>}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}