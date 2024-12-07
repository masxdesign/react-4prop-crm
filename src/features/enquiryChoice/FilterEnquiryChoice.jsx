import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FilterEnquiryChoice = (props) => {

    return (
        <Select {...props}>
            <SelectTrigger className="h-8 w-[100px] text-left">
                <SelectValue placeholder={<span className="text-muted-foreground">Filter by choice</span>} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={null}>All</SelectItem>
                <SelectItem value={2}>PDF</SelectItem>
                <SelectItem value={1}>View</SelectItem>
            </SelectContent>
        </Select>
    )
}

export default FilterEnquiryChoice