import propertyPubClient from './propertyPubClient'

export const fetchSchedulerQueries = async () => {
  const { data } = await propertyPubClient.get('/api/property-scheduler/queries')
  return data.queries
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
