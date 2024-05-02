import { queryOptions } from "@tanstack/react-query"
import { chain, compact, memoize } from "lodash"
import { createSelector } from "reselect"
import queryClient from "@/queryClient"
import companyCombiner from "@/api/companyCombiner"
import { reqPropDescContentQuery, searchPropertiesQuery, subtypesJson, typesJson } from "@/api/fourProp"
import propertySubtypesKeyValueCombiner from "@/api/propertySubtypesKeyValueCombiner"
import propertyTypesCombiner from "@/api/propertyTypesCombiner"
import lowerKeyObject from "@/utils/lowerKeyObject"
import propertyParse from "@/utils/propertyParse"
import { createImmer } from "@/utils/zustand-extras"
import displayTenure from "@/utils/displayTenure"
import displaySize from "@/utils/displaySize"

export const PROPERTY_STATUS_NAMES = {
    0: "AVAILABLE",
    1: "UNDER OFFER", 
    2: "Withdrawn",
    8: "LET", 
    9: "SOLD",
    7: "Unadvertised",
    // obselete
    5: "LET", 
    40: "LET",
    41: "SOLD"
}

export const PROPERTY_STATUS_COLORS = {
    0: "green",
    1: "amber", 
    2: "amber",
    8: "red", 
    9: "red",
    7: "sky",
    // obselete
    5: "amber", 
    40: "amber",
    41: "red"
}

const propertyCombinerMemo = memoize((pid, original, propertyTypes, content, companies_) => {
    const parseTypes = propertyParse.types(propertyTypes, 'id')(original)
    const tenure = propertyParse.tenure(original)
    const addressText = propertyParse.addressText({ showPostcode: true })(original)
    
    const size = propertyParse.size(original)
    const sizeText = size.isIn ? displaySize({ ...size, decimal: 2 }): null
    let landText = null
    
    if(size.land) landText = displaySize({ ...size.land, decimal: 2 })

    const typesText = compact(parseTypes.types.map(t => t.label)).join(', ') ?? ''
    const subtypesText = compact(parseTypes.subtypes.map(t => t.label) ?? []).join(', ')

    const title = `${typesText} to ${tenure.text} in ${addressText}`

    const content_ = propertyParse.content({
        ...original,
        description: content[0] ?? "", 
        locationdesc: content[1] ?? "",  
        amenities: content[2] ?? ""
    })
    
    const companies = propertyParse.companies(companies_)(original)
    const pictures = propertyParse.pictures(original)

    return {
        id: pid,
        title,
        subtypesText,
        addressText,
        pictures,
        thumbnail: pictures.thumbs[0],
        types: parseTypes.types,
        subtypes: parseTypes.subtypes,
        tenureText: displayTenure(tenure),
        sizeText,
        landText,
        size,
        tenure,
        statusText: PROPERTY_STATUS_NAMES[original.status],
        statusColor: PROPERTY_STATUS_COLORS[original.status],
        content: content_,
        companies,
        agents: chain(original.dealswith).trim(',').split(',').uniq().value(),
        original
    }
})

const propertiesSelector = (state) => state.properties

const propertiesArraySelector = createSelector(
    propertiesSelector,
    (properties) => Object.values(properties)
)

const pidsSelector = createSelector(
    propertiesSelector,
    (properties) => Object.keys(properties)
)

const contentsSelector = (state) => state.contents

const selectedSelector = (state) => state.selected

const missingSelector = createSelector(
    pidsSelector,
    contentsSelector,
    selectedSelector,
    (pids, contents, selected) => {
        const missing = selected.filter(pid => !pids.includes(pid))
        const missingContents = selected.filter(pid => !contents[pid])
        return {
            missing,
            missingContents
        }
    }
)

const companiesSelector = createSelector(
    (state) => state.companies,
    (companies) => Object.values(companies).map(companyCombiner)
)

const propertyTypesSelector = createSelector(
    (state) => state.types,
    (state) => state.subtypes,
    (types, subtypes) => {
        const subtypesKeyValue = propertySubtypesKeyValueCombiner(subtypes)
        const propertyTypes = propertyTypesCombiner(types, subtypesKeyValue)
        return propertyTypes
    }
)

const selectedDetailsSelector = createSelector(
    selectedSelector,
    propertyTypesSelector,
    propertiesArraySelector,
    contentsSelector,
    companiesSelector,
    (selected, propertyTypes, propertiesArray, contents, companies) => (
        propertiesArray
            .filter(({ pid }) => selected.includes(pid))
            .map(property => propertyCombinerMemo(property.pid, property, propertyTypes, contents[property.pid], companies))
    )
)

export const resolveAllPropertiesQuerySelector = createSelector(
    selectedSelector,
    state => state.resolveAllProperties,
    (selected, resolveAllProperties) => queryOptions({
        queryKey: ["resolveAllProperties", selected],
        queryFn: resolveAllProperties,
        enabled: selected.length > 0
    })
)

export const propertyTypesReceived = (types, subtypes) => ({
    type: "PROPERTY_TYPES_RECEIVED", 
    payload: { types, subtypes }
})

export const propertiesReceived = (properties) => ({
    type: "PROPERTIES_RECEIVED", 
    payload: properties
})

export const selectedReceived = (selected) => ({
    type: "SELECTED_RECEIVED", 
    payload: selected
})

export const companiesReceived = (companies) => ({
    type: "COMPANIES_RECEIVED", 
    payload: companies
})

export const contentsReceived = (contents) => ({
    type: "CONTENTS_RECEIVED", 
    payload: contents
})

function reducer (state, action) {
    switch (action.type) {
        case "READY":
            const { types, subtypes, properties, companies, selected, contents } = action.payload
            
            reducer(state, propertyTypesReceived(types, subtypes))
            reducer(state, selectedReceived(selected))
            reducer(state, contentsReceived(contents))
            reducer(state, propertiesReceived(properties))
            reducer(state, companiesReceived(companies))

            break
        case "PROPERTY_TYPES_RECEIVED":
            state.types = action.payload.types
            state.subtypes = action.payload.subtypes

            break
        case "AREAS_RECEIVED":
            state.areas = action.payload

            break
        case "VERSIONS_RECEIVED":
            state.versions = action.payload

            break
        case "SELECTED_RECEIVED":
            state.selected = action.payload

            break
        case "PROPERTIES_RECEIVED":
            for (const property of action.payload) {
                const property_ = property.pid ? property : lowerKeyObject(property)
                state.properties[property_.pid] = property_
            }

            break
        case "COMPANIES_RECEIVED":
            for (const company of action.payload) {
                state.companies[company.c] = company
            }

            break
        case "CONTENTS_RECEIVED":
            for (const [pid, content] of Object.entries(action.payload)) {
                state.contents[pid] = content
            }
        default:
            return state
    }
}

export const useListing = createImmer((set, get) => ({
    types: null,
    subtypes: null,
    areas: null,
    versions: null,
    selected: [],
    contents: {},
    properties: {},
    companies: {},
    resolveAllProperties: async () => {
        try {
            const { missing, missingContents } = missingSelector(get())
    
            await Promise.all([
                get().fetchPropertyTypes(),
                get().fetchPropertiesByPids(missing),
                get().fetchContentsByPid(missingContents)
            ])
    
            return selectedDetailsSelector(get())

        } catch (e) {
            console.log(e);
        }
    },
    fetchPropertiesByPids: async (pids) => {
        if (pids.length < 1) return
        const { results, companies } = await queryClient.ensureQueryData(searchPropertiesQuery(pids))
        get().dispatch(propertiesReceived(results))
        get().dispatch(companiesReceived(companies))
    },
    fetchContentsByPid: async (pids) => {
        if (pids.length < 1) return
        const contents = await queryClient.ensureQueryData(reqPropDescContentQuery(pids))
        get().dispatch(contentsReceived(contents))
    },
    fetchPropertyTypes: async () => {
        if (get().types) return
        const [types, subtypes] = await Promise.all([
            queryClient.ensureQueryData(typesJson),
            queryClient.ensureQueryData(subtypesJson)
        ])
        get().dispatch(propertyTypesReceived(types, subtypes))
    },
    dispatch: (args) => set((state) => reducer(state, args))
}))

export default useListing