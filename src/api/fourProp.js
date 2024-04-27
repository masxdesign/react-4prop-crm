import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { isEmpty, map, memoize, truncate, union } from "lodash";
import { sendBizchatMessage } from "./bizchat";
import queryClient from "@/queryClient";
import lowerKeyObject from "@/utils/lowerKeyObject";
import propertyParse from "@/utils/propertyParse";
import propertySubtypesKeyValueCombiner from "./propertySubtypesKeyValueCombiner";
import propertyTypesCombiner from "./propertyTypesCombiner";

export const FOURPROP_BASEURL = window.config?.site_url ?? import.meta.env.VITE_FOURPROP_BASEURL

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

export const fetchSearchProperties = async (pids) => {
    try {
        const { data } = await fourProp.get(`api/search/properties`, { params: { pids } }, { withCredentials: true })
        return data
    } catch(e) {
        console.error(e)
    }
}

export const authLogout = () => fourProp.post('api/account/logout')

export const fetchNegotiators = async ({ columnFilters, sorting, pagination, globalFilter }) => {
    let params = {
        page: pagination.pageIndex + 1,
        perpage: pagination.pageSize,
        include: "id,statusData,alertStatusMessage,statusType,statusCreated,alertSentDate,alertEmailDate,a,company,status,alertEmailClick,alertPerc,openedPerc,alertStatus,alertOpened,last_contact,next_contact,email,first,last,city,postcode,phone,website"
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
    
    const { data } = await fourProp.get('api/crud/CRM--EACH_db', { params })

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

export const sendBizchat = async ({ message, from, recipient }) => {
    if(!from) throw new Error('from is not defined')
    if (isEmpty(message)) throw new Error('message is empty')

    const chat_id = await sendBizchatMessage({ 
        from, 
        recipient, 
        message 
    })

    const { data } = await fourProp.post(`api/crud/CRM--EACH_db/__createBizchatNote/${recipient}`, {
        nid: from,
        chat_id,
        teaser: truncate(message, { length: 30 })
    })

    return data
}

export const addNote = async (variables, { id, user }) => {

    const { message = '', _button } = variables

    if (isEmpty(message)) throw new Error('message is empty')

    if(_button === "bizchat") {

        if(!user?.neg_id) throw new Error('user.neg_id is not defined')

        return sendBizchat({
            message,
            from: user.neg_id,
            recipient: id
        })

    }

    const { data } = await fourProp.post(`api/crud/CRM--EACH_db/__createNote/${id}`, {
        type: '0',
        note: message
    })

    return data

}

export const fetchNotes = async ({ id }) => {

    const { data } = await fourProp.get(`api/crud/CRM--EACH_db/__notes/${id}`)

    const [branch, [privateNotes, messages, users]] = data

    const messages_ = messages.map((message) => ({
        ...message,
        author: users.find(({ id }) => id === message.uid)
    }))

    return [messages_, branch, privateNotes]

}

export const fetchFacets = async ({ column = 'company' }) => {

    const params = {
        group: true,
        column
    }

    const { data } = await fourProp.get('api/crud/CRM--EACH_db', { params })

    return data

}

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

const propertyCombinerMemo = memoize((pid, original, types, subtypes, companies) => {
    const subtypesKeyValue = propertySubtypesKeyValueCombinerMemo(subtypes)
    const propertyTypes = propertyTypesCombinerMemo(types, subtypesKeyValue)
    const parseTypes = propertyParse.types(propertyTypes, 'id')(original)
    // const size = propertyParse.size(original)
    // const tenure = propertyParse.tenure(original)

    return {
        id: pid,
        addressText: propertyParse.addressText({ showPostcode: true })(original),
        pictures: propertyParse.pictures(original),
        types: parseTypes.types,
        subtypes: parseTypes.subtypes,
        size,
        tenure,
        original
    }

})

export const searchProperties = pids => queryOptions({
    queryKey: ['searchProperties', pids],
    queryFn: () => fetchSearchProperties(pids),
    enabled: pids.length > 0
})

export const propertiesDetailsSearch = (pids) => queryOptions({
    queryKey: ['searchPropertiesDetails', pids],
    queryFn: async () => {
        const [{ results, companies }, types, subtypes] = await Promise.all([
            queryClient.ensureQueryData(searchProperties(pids)),
            queryClient.ensureQueryData(typesJson),
            queryClient.ensureQueryData(subtypesJson)
        ])

        const properties_ = results.map(property => lowerKeyObject(property))

        return properties_.map(property => propertyCombinerMemo(property.pid, property, types, subtypes, companies))
    },
    enabled: pids.length > 0
})

export const propertiesDetails = memoize((results) => {
    const { properties, companies } = results
    const properties_ = properties.map(property => lowerKeyObject(property))

    return queryOptions({
        queryKey: ['propertiesDetails', map(properties_, 'pid')],
        queryFn: async () => {
            const [types, subtypes] = await Promise.all([
                queryClient.ensureQueryData(typesJson),
                queryClient.ensureQueryData(subtypesJson)
            ])
            return properties_.map(property => propertyCombinerMemo(property.pid, property, types, subtypes, companies))
        },
        enabled: properties.length > 0
    })
})

export const propertiesDetailsGlobalSelectionQuery = (globalSelection) => {
    const properties_ = globalSelection.properties.map(property => lowerKeyObject(property))

    return queryOptions({
        queryKey: ['propertiesDetailsGlobalSelection', map(properties_, 'pid'), globalSelection.missing],
        queryFn: async () => {
            const [current, missing] = await Promise.all([
                queryClient.ensureQueryData(propertiesDetails(globalSelection)),
                queryClient.ensureQueryData(propertiesDetailsSearch(globalSelection.missing))
            ])

            return union(current, missing)
        },
        enabled: properties_.length > 0
    })
}