import axios from "axios"

export const BIZCHAT_BASEURL = window?.bizChatURL ?? import.meta.env.VITE_BIZCHAT_BASEURL

const bizchatClient = axios.create({
	baseURL: BIZCHAT_BASEURL,
    withCredentials: true
})

// Add cache buster to all GET requests to bypass Azure Front Door caching
bizchatClient.interceptors.request.use((config) => {
  if (config.method === 'get') {
    config.params = { ...config.params, ts: Date.now() }
  }
  return config
})

export default bizchatClient