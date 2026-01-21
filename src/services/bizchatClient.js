import { createAuthClient } from "./createAuthClient"

export const BIZCHAT_BASEURL = window?.bizChatURL ?? import.meta.env.VITE_BIZCHAT_BASEURL

// Create client with JWT authentication and auto-refresh
const bizchatClient = createAuthClient(BIZCHAT_BASEURL, { cacheBuster: true })

export default bizchatClient