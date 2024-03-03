import axios from "axios";

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

export const fetchNegotiators = async ({ queryKey }) => {

    // await grantAccess()

    const [_, columnFilters, sorting, pageSize, pageIndex] = queryKey

    let params = {
        page: pageIndex + 1,
        perpage: pageSize,
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