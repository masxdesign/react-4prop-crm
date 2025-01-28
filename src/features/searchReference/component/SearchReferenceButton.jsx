import { cn } from "@/lib/utils"

const SearchReferenceButton = ({ className, ...props }) => {

    return (
        <div className={cn('inline-flex items-stretch bg-white shadow-sm cursor-pointer border border-sky-200 text-sky-500 text-xs rounded hover:border-sky-500 overflow-hidden', className)} {...props} />
    )
}

export default SearchReferenceButton