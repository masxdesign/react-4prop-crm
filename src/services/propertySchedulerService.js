import propertyPubClient from './propertyPubClient'

export const fetchSchedulerQueries = async () => {
  const { data } = await propertyPubClient.get('/api/property-scheduler/queries')
  return data.queries
}

export const getDiagramUrl = (queryId) => {
  return `${propertyPubClient.defaults.baseURL}/api/property-scheduler/diagram/${encodeURIComponent(queryId)}`
}

export const previewBulkInsert = async ({ advertiser_id, start_date, week_no, cursor = 0, limit = 100, sessionId = null }) => {
  const { data } = await propertyPubClient.post('/api/property-scheduler/preview', {
    advertiser_id,
    start_date,
    week_no,
    cursor,
    limit,
    sessionId,
  })
  return data
}

export const bulkInsertSchedulers = async (payload) => {
  const { data } = await propertyPubClient.post('/api/property-scheduler/', payload)
  return data
}

export const previewBulkInsertByCompany = async ({ advertiser_id, start_date, week_no, sessionId = null }) => {
  const { data } = await propertyPubClient.post('/api/property-scheduler/preview/by-company', {
    advertiser_id,
    start_date,
    week_no,
    sessionId,
  })
  return data
}

export const getCompanyPreviewProperties = async ({ sessionId, companyId, cursor = 0, limit = 50 }) => {
  const { data } = await propertyPubClient.post(
    `/api/property-scheduler/preview/company/${companyId}/properties`,
    { sessionId, cursor, limit }
  )
  return data
}
