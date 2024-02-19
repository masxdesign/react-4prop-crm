import { queryOptions } from "@tanstack/react-query"
import { fetchCategories } from "./api-fakeServer"

const categoriesQueryOptions = queryOptions({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 60_000 })

export default categoriesQueryOptions