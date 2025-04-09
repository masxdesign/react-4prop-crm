import axios from "axios"

export const FOURPROP_LIVE_BASEURL = "https://www.4prop.com"

const isNumericLocalhost = /(http(s?)):\/\/127.0.0.1/.test(window.location.origin)

const fourProp_baseurl = window.config?.site_url ?? import.meta.env.VITE_FOURPROP_BASEURL

export const FOURPROP_BASEURL = isNumericLocalhost
    ? fourProp_baseurl.replace(/localhost:/, '127.0.0.1:')
    : fourProp_baseurl

export const fourPropClient = axios.create({
    baseURL: FOURPROP_BASEURL,
    withCredentials: true
})

export const fourPropLiveClient = axios.create({
    baseURL: FOURPROP_LIVE_BASEURL,
    withCredentials: true
})