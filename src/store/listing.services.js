import { fourPropClient } from "@/services/fourPropClient"
import { zipObject } from "lodash"

export const fetchSuitableProperties = async ({ enquiryChoicesIsNotNull, page = 1, perpage = 15, filters = {} }) => {
    try {

        const { searchRef, choice } = filters

        const params = {
            page,
            enquiryChoicesIsNotNull,
            enquiryMetric: true,
            isSuitable: true,
            perpage,
            orderby: 9,
            filterByTagId: searchRef
        }

        if (choice !== null) {
            delete params.enquiryChoicesIsNotNull
            params.enquiryChoices = choice
        }

        const { data } = await fourPropClient.get(`api/search`, { params })

        return data
    
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