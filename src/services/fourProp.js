import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { find, isEmpty, map, memoize, orderBy, result, truncate, union, zipObject } from "lodash";
import { getAllMailShots, getBizchatLastMessage, getListUnreadTotal, sendBizchatMessage } from "./bizchat";
import queryClient from "@/queryClient";
import lowerKeyObject from "@/utils/lowerKeyObject";
import propertyParse from "@/utils/propertyParse";
import propertySubtypesKeyValueCombiner from "./propertySubtypesKeyValueCombiner";
import propertyTypesCombiner from "./propertyTypesCombiner";
import companyCombiner from "./companyCombiner";
import useListing from "@/store/use-listing";
import { getTime } from "date-fns";

export const FOURPROP_BASEURL = window.config?.site_url ?? import.meta.env.VITE_FOURPROP_BASEURL

const fourPropLive = axios.create({
    baseURL: "https://4prop.com",
    withCredentials: true
})

const fourProp = axios.create({
    baseURL: FOURPROP_BASEURL,
    withCredentials: true
})

const grantAccess = async () => {

    const body = {
        email: 'salgadom7503@gmail.com',
        password: 'elatt54321'
    }

    try {

        const res = await fourProp.post("api/login", body)

    } catch (e) {
        console.log("Grant Access: " + e.message)
    }

}

export const authWhoisonlineQueryOptions = queryOptions({
    queryKey: ['whoisonline'],
    queryFn: async () => {
        const { data } = await fourProp.post('api/login')

        return data
    },
    staleTime: Infinity
})

export const authLogin = async ({ email, password }) => {
    const { default: each_password_generator } = await import("@/utils/each_password_generator")

    const { data } = await fourProp.post(
        'api/login', 
        { email, password, each_password: each_password_generator(password) }
    )
    
    return data
}

export const fetchUser = async (uid) => {
    const { data } = await fourProp.post(
        'api/account/fetch-user', 
        { id: uid }
    )
    
    return data
}

export const fetchSearchProperties = async (pids) => {
    try {

        if (pids.length < 1) return { results: [], companies: [] }

        const { data } = await fourProp.get(`api/search/properties`, { params: { pids } }, { withCredentials: true })

        return data
    
    } catch(e) {
        console.error(e)
    }
}

export const fetchNewlyGradedProperties = async () => {
    try {

        const { data } = await fourProp.get(`api/search/newlyGraded`, { withCredentials: true })

        return data
    
    } catch (e) {
        console.error(e)
    }
}

export const authLogout = () => fourProp.post('api/account/logout')

const defaultNegotiatorInclude = "id,type,statusData,alertStatusMessage,statusType,statusCreated,alertSentDate,alertEmailDate,a,company,status,alertEmailClick,alertPerc,openedPerc,alertStatus,alertOpened,last_contact,next_contact,email,first,last,city,postcode,phone,website,position,department,mobile,mail_list_max_date_sent,mail_list_total,mail_list_template_name"

export const fetchNegotiators = async ({ columnFilters, sorting, pagination, globalFilter }, authUserId) => {
    let params = {
        page: pagination.pageIndex + 1,
        perpage: pagination.pageSize,
        include: defaultNegotiatorInclude
    }

    const [sorting_] = sorting

    if(sorting_) {

        const { id, desc } = sorting_

        params = {
            ...params,
            orderBy: id,
            direction: desc ? 'desc' : 'asc'
        }

    }

    const column = []
    const search = []

    for(const filter of columnFilters) {
        const { id, value } = filter
        let [toSearch] = value
        
        column.push(id)

        if (['a', 'company'].includes(id)) {
            toSearch = `=${toSearch}`
        }

        search.push(toSearch)
    }

    if (globalFilter?.column) {
        column.push(globalFilter.column)
        search.push(globalFilter.search)
    }

    if (column.length > 0) {
        params = {
            ...params,
            search,
            column
        }
    }
    
    let { data } = await fourProp.get('api/crud/CRM--EACH_db', { params })

    if (authUserId) {
        let d2 = []
        
        if (data[1].length > 0) {
            const recipients = map(data[1], 'id')
            d2 = await getListUnreadTotal({ from: authUserId, recipients })
        }

        const data2 = [data[0], data[1].map(item => ({
            ...item,
            unread_total: find(d2, { recipient: item.id })?.unread_total ?? 0
        }))]

        return data2
    }


    return data
}

export const fetchNegotiatorByNids = async (nids) => {
    let params = {
        include: defaultNegotiatorInclude,
        ids: `${nids}`
    }

    const { data } = await fourProp.get(`api/crud/CRM--EACH_db`, { params })

    return data
}

export const fetchSelectedNegotiatorsDataQueryOptions = (dataPool, selected) => queryOptions({
    queryKey: ['fetchSelectedNegotiatorsData', selected],
    queryFn: async () => {

        const nidsToFetch = selected.filter(id => !dataPool.has(id))

        if (nidsToFetch.length > 0) {

            const fetched = await fetchNegotiatorByNids(nidsToFetch)

            for(const item of fetched) {
                dataPool.set(item.id, item)
            }

        }

        return selected.map(id => dataPool.get(id))
    }
})

export const fetchSelectedDataQueryOptions = (dataPool, selected, onFetch) => queryOptions({
    queryKey: ['fetchedSelectedData', selected],
    queryFn: async () => {

        const idsToFetch = selected.filter(id => !dataPool.has(id))

        if (idsToFetch.length > 0) {

            const fetched = await onFetch(idsToFetch)

            for(const item of fetched) {
                dataPool.set(item.id, item)
            }

        }

        return selected.map(id => dataPool.get(id))
    }
})

export const fetchNegotiator = async (nid) => {
    let params = {
        include: defaultNegotiatorInclude
    }

    const { data } = await fourProp.get(`api/crud/CRM--EACH_db/${nid}`, { params })

    return data
}

export const addNextContact = async (variables, { id }) => {
    const { next_contact, message = '' } = variables

    let body = {}

    if (next_contact) {
        body.type = isEmpty(message) ? '3' : '2'
        body.next = next_contact
    } else {
        body.type = '4'
        body.noNextDate = true
    }

    body.note = message

    const { data } = await fourProp.post(`api/crud/CRM--EACH_db/__createContactNote/${id}`, body)

    return data

}

export const addLastContact = async (variables, { id }) => {

    const { last_contact, message = '' } = variables

    if (isEmpty(last_contact)) throw new Error('last_contact is empty')

    let body = {
        type: '1',
        last: last_contact,
        note: message
    }

    const { data } = await fourProp.post(`api/crud/CRM--EACH_db/__createContactNote/${id}`, body)

    return data

}

export const addNote = async (variables, id, authUserId) => {
    const { message = '', files, _button } = variables

    if (_button === "bizchat") {

        if (files.length < 1 && isEmpty(message)) throw new Error('attachments and message is empty')

        if(!authUserId) throw new Error('authUserId is not defined')

        return sendBizchatMessage({ 
            files,
            message,
            from: authUserId,
            recipient: id
        })

    }

    if (isEmpty(message)) throw new Error('message is empty')

    const { data } = await fourProp.post(`api/crud/CRM--EACH_db/__createNote/${id}`, {
        type: '0',
        note: message
    })

    return data

}

export const fetchNotes = async (recipient, auth) => {
    let [notes, lastMessage, mailshots] = await Promise.all([
        fourProp.get(`api/crud/CRM--EACH_db/__notes/${recipient}`, { withCredentials: true }),
        getBizchatLastMessage({ from: auth.user.neg_id, recipient }),
        getAllMailShots(recipient, auth.id)
    ])

    const [branch, [privateNotes, messages, users]] = notes.data

    let messages_ = messages.map((message) => ({
        ...message,
        author: users.find(({ id }) => id === message.uid),
        created_time: getTime(message.created)
    }))

    if (lastMessage) {
        messages_.push({
            id: `bz:${lastMessage.id}`,
            lastMessage,
            created: lastMessage.sent,
            created_time: getTime(lastMessage.sent.replace(/[Z,T]/g, ' ').trim())
        })
    }

    if (mailshots.length > 0) {
        mailshots = mailshots.map(item => ({
            ...item,
            link: `${FOURPROP_BASEURL}/marketing-campaigns/campaigns/${item.campaign_id}/update-mail-list/${item.campaign_emaillist_id}`,
        }))

        mailshots.forEach(item => {
            messages_.push({
                id: `ml:${item.id}`,
                mailshot: item,
                created: item.date_sent,
                created_time: getTime(item.date_sent.replace(/[Z,T]/g, ' ').trim())
            })
        })
    }

    const orderedMessages = orderBy(messages_, ['created_time'], ['asc'])

    return [orderedMessages, branch, privateNotes, lastMessage, mailshots]
}

export const fetchFacets = async (column = 'company') => {

    const params = {
        group: true,
        column
    }

    const { data } = await fourProp.get('api/crud/CRM--EACH_db', { params })

    return data

}

export const reqPropDescContentQuery = (reqPropContentByIds, isProp = true) => queryOptions({
    queryKey: ["reqPropDescContent", reqPropContentByIds, isProp],
    queryFn: async () => {
        const params = { reqPropContentByIds: reqPropContentByIds.join(','), isProp }
        const { data } = await fourProp.get(`/api/each`, { params, withCredentials: true })

        return zipObject(reqPropContentByIds, data)
    }
})

export const versionsJson = queryOptions({
    queryKey: ["versionsJson"],
    queryFn: () => fourProp.get(`new/variables/versions.json`, { withCredentials: false })
})

export const dataJson = name => queryOptions({
    queryKey: ["dataJson", name],
    queryFn: async () => {
        const versions = await queryClient.ensureQueryData(versionsJson)
        const { data } = await fourProp.get(`new/variables/${name}${versions.data[name]}.json`, { withCredentials: false })
        return data
    }
})

export const typesJson = dataJson("types")
export const subtypesJson = dataJson("subtypes")
export const areasJson = dataJson("locations")

const propertySubtypesKeyValueCombinerMemo = memoize(propertySubtypesKeyValueCombiner)
const propertyTypesCombinerMemo = memoize(propertyTypesCombiner)

const propertyCombinerMemo = memoize((pid, original, types, subtypes, content, companies_) => {
    const subtypesKeyValue = propertySubtypesKeyValueCombinerMemo(subtypes)
    const propertyTypes = propertyTypesCombinerMemo(types, subtypesKeyValue)
    const parseTypes = propertyParse.types(propertyTypes, 'id')(original)
    const size = propertyParse.size(original)
    const tenure = propertyParse.tenure(original)

    const content_ = propertyParse.content({
        ...original,
        description: content[0] ?? "", 
        locationdesc: content[1] ?? "",  
        amenities: content[2] ?? ""
    })
    
    const companies = propertyParse.companies(companies_.map(companyCombiner))(original)

    return {
        id: pid,
        addressText: propertyParse.addressText({ showPostcode: true })(original),
        pictures: propertyParse.pictures(original),
        types: parseTypes.types,
        subtypes: parseTypes.subtypes,
        size,
        tenure,
        content: content_,
        companies,
        original
    }

})

export const searchPropertiesQuery = pids => queryOptions({
    queryKey: ['searchProperties', pids],
    queryFn: () => fetchSearchProperties(pids)
})

export const propertiesDetailsSearchQuery = pids => queryOptions({
    queryKey: ['searchPropertiesDetails', pids],
    queryFn: async () => {
        if (pids.length < 1) return []

        const [{ results, companies }, contents, types, subtypes] = await Promise.all([
            queryClient.ensureQueryData(searchPropertiesQuery(pids)),
            queryClient.ensureQueryData(reqPropDescContentQuery(pids)),
            queryClient.ensureQueryData(typesJson),
            queryClient.ensureQueryData(subtypesJson)
        ])

        const { setProperties, setCompanies } = useListing.getState()

        const properties_ = results.map(property => lowerKeyObject(property))

        const propertiesDetails =  properties_.map(property => (
            propertyCombinerMemo(
                property.pid, 
                property, 
                types, 
                subtypes, 
                contents[property.pid], 
                companies
            )
        ))

        setProperties(propertiesDetails)
        setCompanies(companies)

        return propertiesDetails
    }
})

export const propertiesDetailsQuery = memoize(results => {
    const { properties, companies } = results
    const properties_ = properties.map(property => lowerKeyObject(property))
    const pids = map(properties_, 'pid')

    return queryOptions({
        queryKey: ['propertiesDetails', pids],
        queryFn: async () => {
            if (properties_.length < 1) return []

            const [contents, types, subtypes] = await Promise.all([
                queryClient.ensureQueryData(reqPropDescContentQuery(pids)),
                queryClient.ensureQueryData(typesJson),
                queryClient.ensureQueryData(subtypesJson)
            ])

            const { setProperties, setCompanies } = useListing.getState()

            const propertiesDetails = properties_.map(property => (
                propertyCombinerMemo(
                    property.pid, 
                    property, 
                    types, 
                    subtypes, 
                    contents[property.pid], 
                    companies
                )
            ))

            setProperties(propertiesDetails)
            setCompanies(companies)

            return propertiesDetails
        }
    })
})

export const propertiesDetailsGlobalSelectionQuery = globalSelection => {
    const properties_ = globalSelection.properties.map(property => lowerKeyObject(property))

    return queryOptions({
        queryKey: ['propertiesDetailsGlobalSelection', map(properties_, 'pid'), globalSelection.missing],
        queryFn: async () => {
            try {
                if (properties_.length < 1 && globalSelection.missing.length < 1) return []
                
                const [current, missing] = await Promise.all([
                    queryClient.ensureQueryData(propertiesDetailsQuery(globalSelection)),
                    queryClient.ensureQueryData(propertiesDetailsSearchQuery(globalSelection.missing))
                ])

                const properties =  union(current, missing)
    
                return properties

            } catch (e) {
                console.log(e);
            }
        }
    })
}