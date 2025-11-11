import axios from "axios"

// Dev mode: https://localhost:8081
// Prod mode: https://property.pub
export const PROPERTYPUB_BASEURL = window?.propertyPubURL ?? import.meta.env.VITE_PROPERTYPUB_BASEURL

const propertyPubClient = axios.create({
	baseURL: PROPERTYPUB_BASEURL,
    withCredentials: true
})

export default propertyPubClient
