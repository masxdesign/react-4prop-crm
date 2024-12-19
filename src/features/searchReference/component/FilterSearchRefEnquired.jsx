import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useSearchReferenceListingEnquired from "../searchReference.hooks"

export default function FilterSearchRefEnquired({ value = null, showCount, onValueChange }) {
    const { data } = useSearchReferenceListingEnquired() 

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
                    >
                        {row.name} {showCount && row.count > 0 && <span className="rounded bg-sky-100 px-2 ml-2">{row.count}</span>}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}