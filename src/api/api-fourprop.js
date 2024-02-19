import axios from "axios";

const API_FOURPROP_BASEURL = 'http://localhost:8082'

const apiFourProp = axios.create({
    baseURL: API_FOURPROP_BASEURL
})

export const getClients = async () => (await apiFourProp.get('/crm')).data
export const addClient = async (body) => (await apiFourProp.post('/crm', body)).data