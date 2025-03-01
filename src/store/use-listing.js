import { queryOptions, useQuery } from "@tanstack/react-query"
import _, { chain, compact, find, map, pick } from "lodash"
import { createSelector } from "reselect"
import queryClient from "@/queryClient"
import companyCombiner from "@/services/companyCombiner"
import { fetchNewlyGradedProperties, searchPropertiesQuery } from "@/services/fourProp"
import propertySubtypesKeyValueCombiner from "@/services/propertySubtypesKeyValueCombiner"
import propertyTypesCombiner from "@/services/propertyTypesCombiner"
import lowerKeyObject from "@/utils/lowerKeyObject"
import propertyParse from "@/utils/propertyParse"
import { createImmer } from "@/utils/zustand-extras"
import displayTenure from "@/utils/displayTenure"
import displaySize from "@/utils/displaySize"
import { crmSharedPids } from "@/services/bizchat"
import { propReqContentsQuery, subtypesQuery, typesQuery } from "./listing.queries"
import myDateTimeFormat from "@/utils/myDateTimeFormat"
import { FOURPROP_BASEURL } from "@/services/fourPropClient"

export const IS_NULL = "IS_NULL"

export const PROPERTY_STATUS_NAMES = {
    0: "AVAIL",
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

const defaultPropertyDetailsSetting = {
    addressShowMore: false,
    addressShowBuilding: false
}

const defaultUserInfo = {
    gradeShare: false,
    client: null,
    agent: null
}

const enquiredUserInfo = (auth, enquired) => {
    if (auth.isAgent) {
        return {
            ...defaultUserInfo,
            agent: auth.user.id,
            gradeShare: enquired.client?.isGradeShare
        }
    } 
    
    return {
        ...defaultUserInfo,
        client: auth.user.id,
        gradeShare: !!enquired.from_uid
    }
}

const propertyEnquiredVariablesCombiner = (original, companies_pool, companies, clientsFromUids, auth) => {
    let client = null
    let from_uid = null
    let company = companies[0]

    let brand = null
    
    const i_am_the_enquirier = original.gradinguid === auth?.user.id
    const agent_to_agent = auth?.isAgent && i_am_the_enquirier

    if (company) {
        brand = {
            name: company.name,
            phone: company.phone,
            logo: company.logo.original
        }
    }

    if (auth) {

        if (auth.isAgent) {

            if (!i_am_the_enquirier) {

                client = clientsFromUids.find(client => client.id === original.gradinguid)
                
                if (client) {
                    const isGradeShare = original.grade_from_uid === auth.user.id

                    if (isGradeShare) {
                        brand = {
                            name: auth.user.company.name,
                            phone: auth.user.company.phone,
                            logo: `${FOURPROP_BASEURL}/${auth.user.company.logo}`
                        }
                    }
            
                    client = {
                        ...client,
                        isGradeShare
                    }
                }

            }


        } else {

            from_uid = clientsFromUids.find(client => client.id === original.grade_from_uid)

            if (from_uid) {

                company = companies_pool.find((row) => row.cid === from_uid.cid)

                from_uid = {
                    ...from_uid,
                    company 
                }

                brand = {
                    name: company.name,
                    phone: company.phone,
                    logo: company.logo.original
                }

            }

        }

    }

    const enquired = {
        brand,
        i_am_the_enquirier,
        agent_to_agent,
        company,
        client,
        from_uid,
        isEnquiry: client?.id ?? from_uid?.id ?? original.gradinguid,
        need_reply: original.last_sender !== null,
        gradinguid: original.gradinguid ? parseInt(original.gradinguid): undefined
    }

    return {
        ...enquired,
        userInfo: enquiredUserInfo(auth, enquired)
    }
}

const propertyCombiner = (pid, original, propertyTypes, content = [], companies_pool, clientsFromUids = [], setting = defaultPropertyDetailsSetting, auth = null) => {
    const { addressShowMore, addressShowBuilding } = setting
    
    const parseTypes = propertyParse.types(propertyTypes, 'id')(original)
    const tenure = propertyParse.tenure(original)

    const addressText = propertyParse.addressText({ 
        showMore: addressShowMore, 
        showBuilding: addressShowBuilding, 
        showPostcode: true 
    })(original)
    
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
    
    const companies = propertyParse.companies(companies_pool)(original)
    const pictures = propertyParse.pictures(original)

    const { grade, gradingupdated, grade_from_uid, chat_id, tag_name, tag_id, enquiry_choices } = original

    const enquired = propertyEnquiredVariablesCombiner(original, companies_pool, companies, clientsFromUids, auth)
    
    return {
        id: pid,
        enquired,
        enquiry_choices,
        tag_name,
        tag_id,
        title,
        grade,
        chat_id,
        subtypesText,
        addressText,
        pictures,
        thumbnail: pictures.thumbs[0],
        types: parseTypes.types,
        subtypes: parseTypes.subtypes,
        grade_from_uid,
        grade_updated: gradingupdated ? myDateTimeFormat(gradingupdated): null,
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
        original,
        lat: parseFloat(original.latitude),
        lng: parseFloat(original.longitude),
        key: `${pid}.${original.gradinguid}`
    }
}

const propertiesSelector = (state) => state.properties
const filterByTagsSelector = (state) => state.filterByTags

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

export const propertyTypescombiner = (types, subtypes) => {
    const subtypesKeyValue = propertySubtypesKeyValueCombiner(subtypes)
    const propertyTypes = propertyTypesCombiner(types, subtypesKeyValue)
    return propertyTypes
}

const propertyTypesSelector = createSelector(
    (state) => state.types,
    (state) => state.subtypes,
    (types, subtypes) => {
        const subtypesKeyValue = propertySubtypesKeyValueCombiner(subtypes)
        const propertyTypes = propertyTypesCombiner(types, subtypesKeyValue)
        return propertyTypes
    }
)

export const detailsCombiner = (propertyTypes, propertiesArray, contents, companies, clientsFromUids = [], settings = defaultPropertyDetailsSetting, auth = null) => (
    propertiesArray
        .map(property => propertyCombiner(property.pid, property, propertyTypes, contents[property.pid], companies, clientsFromUids, settings, auth))
)

const selectedDetailsCombiner = (selected, propertyTypes, propertiesArray, contents, companies) => (
    propertiesArray
        .filter(({ pid }) => selected.includes(pid))
        .map(property => propertyCombiner(property.pid, property, propertyTypes, contents[property.pid], companies))
)

const makeSelectedDetailsSelector = createSelector(
    (_, selected) => selected,
    propertyTypesSelector,
    propertiesArraySelector,
    contentsSelector,
    companiesSelector,
    selectedDetailsCombiner
)

const detailsSelector = createSelector(
    propertyTypesSelector,
    propertiesArraySelector,
    contentsSelector,
    companiesSelector,
    detailsCombiner
)

const filterPropertiesArrayByTagsSelector = createSelector(
    propertiesArraySelector,
    filterByTagsSelector,
    (properties, filterByTags) => {
        return properties.filter(row => {
            const value = row.tag_id === null ? IS_NULL: `${row.tag_id}`
            return filterByTags.includes(value)
        })
    }
)

export const filteredByTagsDetailsSelector = createSelector(
    propertyTypesSelector,
    filterPropertiesArrayByTagsSelector,
    contentsSelector,
    companiesSelector,
    detailsCombiner
)

export const tagsFromPropertiesSelector = createSelector(
    propertiesArraySelector,
    (properties) => {
        const tags = chain(properties)
            .map(row => {
                const { tag_id, tag_name } = pick(row, ["tag_id", "tag_name"])

                if (tag_id === null) {
                    return {
                        id: IS_NULL,
                        name: "Unnamed",
                        weight: 0
                    }
                }

                return {
                    id: tag_id,
                    name: tag_name,
                    weight: 1
                }
            })
            .uniqBy("id")
            .sortBy(["weight", "name"])
            .value()

        return tags
    }
)

const selectedDetailsSelector = createSelector(
    selectedSelector,
    propertyTypesSelector,
    propertiesArraySelector,
    contentsSelector,
    companiesSelector,
    selectedDetailsCombiner
)

export const resolveAllPropertiesQuerySelector = createSelector(
    selectedSelector,
    state => state.resolveAllProperties,
    (selected, resolveAllProperties) => ({
        queryKey: ["resolveAllProperties", selected],
        queryFn: resolveAllProperties,
        enabled: selected.length > 0
    })
)

export const newlyGradedQuery = {
    queryKey: ['newlyGraded'],
    queryFn: fetchNewlyGradedProperties
}

export const propertyTypesReceived = (types, subtypes) => ({
    type: "PROPERTY_TYPES_RECEIVED", 
    payload: { types, subtypes }
})

export const propertiesReceived = (properties) => ({
    type: "PROPERTIES_RECEIVED", 
    payload: properties
})

export const propertyGradeChanged = (pid, grade) => ({
    type: "PROPERTY_GRADE_CHANGED", 
    payload: grade,
    meta: { pid }
})

export const propertySearchReferenceChanged = (pid, tag) => ({
    type: "PROPERTY_SEARCH_REFERENCE_CHANGED", 
    payload: tag,
    meta: { pid }
})

export const allPropertySearchReferenceRenamed = (tag_id, newName) => ({
    type: "ALL_PROPERTY_SEARCH_REFERENCE_RENAMED", 
    payload: newName,
    meta: { tag_id }
})

export const propertyRemoved = (pid) => ({
    type: "PROPERTY_REMOVED", 
    payload: null,
    meta: { pid }
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

            if (!action.payload) return
            
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
                const property_ = lowerKeyObject(property)
                state.properties[property_.pid] = property_
            }

            break
        case "PROPERTY_REMOVED":
            delete state.properties[action.meta.pid]

            break
        case "PROPERTY_GRADE_CHANGED": {

            const row = state.properties[action.meta.pid]

            if(!row) break

            row.grade = action.payload

            break
        }
        case "PROPERTY_SEARCH_REFERENCE_CHANGED": {

            const row = state.properties[action.meta.pid]

            if(!row) break

            row.tag_id = action.payload.id
            row.tag_name = action.payload.name

            break
        }
        case "ALL_PROPERTY_SEARCH_REFERENCE_RENAMED": {

            Object.entries(state.properties).forEach(([__, row]) => {

                if (!_.isEqual(row.tag_id, action.meta.tag_id)) return

                row.tag_name = action.payload

            })

            break
        }
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
    allChecked: true,
    filterByTags: [],
    types: null,
    subtypes: null,
    areas: null,
    versions: null,
    selected: [],
    contents: {},
    properties: {},
    companies: {},
    setAllChecked: (allChecked) => {
        set({ allChecked })
    },
    setFilterByTagsChange: (filterByTags) => {
        set({ filterByTags })
    },
    filterByTagsChange: ({ value, checked }) => {
        set(state => {

            if (checked) {
                state.filterByTags.push(value)
                return
            }

            const index = state.filterByTags.indexOf(value)

            state.filterByTags.splice(index, 1)

        })
    },
    resolveSharedPropDetailsQueryOptions: (from, import_id, tag_id = null) => {
        return queryOptions({
            queryKey: ['resolveProperty', from, import_id, tag_id],
            queryFn: async () => {

                const shared = await crmSharedPids(from, import_id, tag_id)

                if (shared.length < 1) return []

                const list = await get().resolvePropertiesDetails(map(shared, 'pid'))

                return list.map(details => ({
                    ...details,
                    shared: find(shared, { pid: details.id })
                }))

            }
        })
    },
    resolvePropertyDetailsQueryOptions: pid => {
        return queryOptions({
            queryKey: ['resolveProperty', pid],
            queryFn: async () => {
                const [details] = await get().resolvePropertiesDetails([`${pid}`])
                
                return details
            }
        })
    },
    resolvePropertiesDetails: async pids => {
        try {

            await get().resolvePids(pids)

            const details = makeSelectedDetailsSelector(get(), pids)

            return details

        } catch (e) {
            console.log(e);
        }
    },
    resolveAllProperties: async () => {
        try {
            const { missing, missingContents } = missingSelector(get())
    
            await get().resolvePids(missing, missingContents)
    
            return selectedDetailsSelector(get())

        } catch (e) {
            console.log(e);
        }
    },
    resolvePids: (pids, pidsContents = null) => {
        try {

            return Promise.all([
                get().fetchPropertyTypes(),
                get().fetchPropertiesByPids(pids),
                get().fetchContentsByPids(pidsContents ?? pids)
            ])

        } catch (e) {
            console.log(e);
        }
    },
    fetchPropertiesByPids: async (pids) => {
        if (pids.length < 1) return
        const { results, companies } = await queryClient.ensureQueryData(searchPropertiesQuery(pids))

        if (!results || results.length < 1 || !companies) throw new Error('Invalid pids')

        get().dispatch(propertiesReceived(results))
        get().dispatch(companiesReceived(companies))
    },
    fetchNewlyGradedProperties: async () => {

        try {

            await get().fetchPropertyTypes()
    
            const { results, companies } = await queryClient.ensureQueryData(newlyGradedQuery)
    
            if (!results || results.length < 1 || !companies) throw new Error('Invalid pids')
    
            get().dispatch(propertiesReceived(results))
            
            const pids = pidsSelector(get())

            get().fetchContentsByPids(pids)
    
            get().dispatch(companiesReceived(companies))
    
            const details = detailsSelector(get())
    
            return details

        } catch (e) {
            return []
        }
    },
    fetchContentsByPids: async (pids) => {
        if (pids.length < 1) return
        const contents = await queryClient.ensureQueryData(propReqContentsQuery(pids))
        get().dispatch(contentsReceived(contents))
    },
    fetchPropertyTypes: async () => {
        if (get().types) return
        const [types, subtypes] = await Promise.all([
            queryClient.ensureQueryData(typesQuery),
            queryClient.ensureQueryData(subtypesQuery)
        ])
        get().dispatch(propertyTypesReceived(types, subtypes))
    },
    dispatch: (args) => set((state) => reducer(state, args))
}))

export const useQueryfetchNewlyGradedProperties = () => {
    const fetchNewlyGradedProperties = useListing(state => state.fetchNewlyGradedProperties)
    return useQuery({
        queryKey: ['newlyGradedWithDetails'],
        queryFn: fetchNewlyGradedProperties
    })
}

export default useListing