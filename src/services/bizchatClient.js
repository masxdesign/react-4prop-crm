import axios from "axios"

export const BIZCHAT_BASEURL = window?.bizChatURL ?? import.meta.env.VITE_BIZCHAT_BASEURL

const bizchatClient = axios.create({
	baseURL: BIZCHAT_BASEURL,
    withCredentials: true
})

export default bizchatClient