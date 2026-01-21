import { createAuthClient } from "./createAuthClient"

// Dev mode: https://localhost:8081
// Prod mode: https://property.pub
export const PROPERTYPUB_BASEURL = window?.propertyPubURL ?? import.meta.env.VITE_PROPERTYPUB_BASEURL

// Create client with JWT authentication and auto-refresh
const propertyPubClient = createAuthClient(PROPERTYPUB_BASEURL, { cacheBuster: true })

export default propertyPubClient
