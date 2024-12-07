import { useAuth } from "@/components/Auth/Auth-context"
import { useSuspenseQuery } from "@tanstack/react-query"
import { searchReferenceListingQuery } from "../searchReference.queries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FilterSearchRef({ value = null, onValueChange }) {
    const auth = useAuth()

    const { data } = useSuspenseQuery(searchReferenceListingQuery(auth.authUserId)) 

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-8 w-[180px] text-left">
                <SelectValue placeholder={<span className="text-muted-foreground">Filter by search reference</span>} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={null}>All</SelectItem>
                {data.map(row => (
                    <SelectItem 
                        key={row.id} 
                        value={row.id}
                    >
                        {row.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}