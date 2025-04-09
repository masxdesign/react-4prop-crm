import { fourPropClient } from "@/services/fourPropClient"
import lowerKeyObject from "@/utils/lowerKeyObject"
import { zipObject } from "lodash"

export const fetchProperties = async (params) => {
    const { data } = await fourPropClient.get(`api/search`, { params })

    if (!data) throw new Error("no results")

    return {
        ...data,
        companies: data.companies ?? [],
        results: data.results?.map(row => lowerKeyObject(row)) ?? []
    }
}

export const fetchEnquiredPropertyByPid = (pid, hash, gradingUid = null) => fetchProperties({
    pids: `${pid}`,
    limit: 1,
    enquiryMetric: true,
    isSuitable: true,
    i: hash,
    gradingUid
})

export const fetchSuitableProperties = ({ hash, enquiryChoicesIsNotNull, inactive = false, page = 1, perpage = 15, filters = {} }) => {
    try {

        const { searchRef, choice } = filters

        const params = {
            page,
            enquiryChoicesIsNotNull,
            enquiryMetric: true,
            isSuitable: true,
            perpage,
            orderby: 9,
            i: hash,
            grade: inactive ? "1": "2,3,4",
            filterByTagId: searchRef
        }

        if (choice !== null) {
            delete params.enquiryChoicesIsNotNull
            params.enquiryChoices = choice
        }

        return fetchProperties(params)
    
    } catch (e) {
        console.error(e)
    }
}

export const fetchSuitablePropertiesEnquiried = (params) => 
    fetchSuitableProperties({ enquiryChoicesIsNotNull: true, ...params })

export const fetchversionsJson = async () => {
    const { data } = await fourPropClient.get(`new/variables/versions.json`, { withCredentials: false })

    return data
}

export const fetchDataJson = async (name, version = 0) => {
    const { data } = await fourPropClient.get(`new/variables/${name}${version}.json`, { withCredentials: false })
    
    return data
}

export const fetchPropReqContentsQuery = async (ids, isProp) => {
    const params = { 
        reqPropContentByIds: ids.join(','), 
        isProp 
    }

    const { data } = await fourPropClient.get(`/api/each`, { params })

    return zipObject(ids, data)
}