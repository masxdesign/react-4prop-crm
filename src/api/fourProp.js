import queryClient from "@/queryClient";
import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { isEmpty } from "lodash";

// const FOURPROP_BASEURL = 'https://www.4prop.com'
const FOURPROP_BASEURL = 'https://localhost:50443'

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

export const authLogout = () => fourProp.post('api/account/logout')

export const fetchNegotiators = async ({ columnFilters, sorting, pagination }) => {
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

    const [columnFilter_] = columnFilters

    if(columnFilter_) {

        const { id, value } = columnFilter_

        params = {
            ...params,
            search: value,
            column: id
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

export const addNote = async (variables, { id }) => {

    const { message = '' } = variables

    if (isEmpty(message)) throw new Error('message is empty')

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