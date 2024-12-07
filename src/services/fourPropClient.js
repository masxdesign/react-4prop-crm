import axios from "axios"

export const FOURPROP_BASEURL = window.config?.site_url ?? import.meta.env.VITE_FOURPROP_BASEURL

export const fourPropClient = axios.create({
    baseURL: FOURPROP_BASEURL,
    withCredentials: true
})

export const fourPropLiveClient = axios.create({
    baseURL: "https://4prop.com",
    withCredentials: true
})