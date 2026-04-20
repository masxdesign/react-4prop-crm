import axios from 'axios'

const STREET_LOCATIONS_API_URL = import.meta.env.VITE_STREET_LOCATIONS_API_URL
const STREET_LOCATIONS_API_KEY = import.meta.env.VITE_STREET_LOCATIONS_API_KEY

const streetLocationsClient = axios.create({
  baseURL: STREET_LOCATIONS_API_URL,
})

streetLocationsClient.interceptors.request.use((config) => {
  config.headers['X-API-Key'] = STREET_LOCATIONS_API_KEY
  config.headers['Content-Type'] = 'application/json'
  config.params = { ...config.params, ts: Date.now() }
  return config
})

export default streetLocationsClient
