import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { fetchDataJson, fetchPropReqContentsQuery, fetchSuitablePropertiesEnquiried, fetchversionsJson } from "./listing.services";
import queryClient from "@/queryClient";

export const suitablePropertiesEnquiriedQuery = ({ page = 1, perpage = 10, filters }) => queryOptions({
    queryKey: ['suitablePropertiesEnquiried', filters, page, perpage],
    queryFn: () => fetchSuitablePropertiesEnquiried({ page, perpage, filters }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20
})

const versionsJsonQuery = queryOptions({
    queryKey: ["versionsJson"],
    queryFn: () => fetchversionsJson()
})

export const dataJsonQuery = (name) => queryOptions({
    queryKey: ["dataJson", name],
    queryFn: async () => {
        const versions = await queryClient.ensureQueryData(versionsJsonQuery)
        return fetchDataJson(name, versions[name])
    },
    staleTime: 1000 * 60 * 20
})

export const typesQuery = dataJsonQuery("types")
export const subtypesQuery = dataJsonQuery("subtypes")
export const areasQuery = dataJsonQuery("locations")

export const propReqContentsQuery = (ids, isProp = true) => queryOptions({
    queryKey: ["propertyContentsQuery", ids, isProp],
    queryFn: () => fetchPropReqContentsQuery(ids, isProp),
    staleTime: 1000 * 60 * 3
})