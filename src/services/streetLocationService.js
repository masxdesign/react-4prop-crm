import axios from 'axios'
import streetLocationsClient from './streetLocationsClient'

const N8N_STREET_PHASE_WEBHOOK_URL = import.meta.env.VITE_N8N_STREET_PHASE_WEBHOOK_URL
const N8N_STREET_ALL_PHASES_WEBHOOK_URL = import.meta.env.VITE_N8N_STREET_ALL_PHASES_WEBHOOK_URL

export const fetchStreetLocationsByPrefix = async (prefix) => {
  const { data } = await streetLocationsClient.post('', {
    query: `
      query StreetLocationsByPrefix($prefix: String!) {
        streetLocationsByPrefix(prefix: $prefix) {
          id
          prefix
          postcode
          street
          suburb
          lat
          lon
          key_anchors_completed_at
          nearest_stations_completed_at
          seo_completed_at
          pre_blog_completed_at
          post_blog_completed_at
          image_completed_at
          publish_completed_at
          last_error
          curated_nearby
        }
      }
    `,
    variables: { prefix },
  })
  return data.data.streetLocationsByPrefix
}

export const fetchStreetLocation = async (id) => {
  const { data } = await streetLocationsClient.post('', {
    query: `
      query StreetLocation($id: Int!) {
        streetLocation(id: $id) {
          id
          prefix
          postcode
          street
          suburb
          lat
          lon
          neighbourhood
          borough
          nearest_stations
          key_anchors
          curated_nearby
          custom_anchors
          key_anchors_radius
          nearest_stations_radius
          key_anchors_completed_at
          nearest_stations_completed_at
          seed_tone_type
          seed_title
          seed_keyword
          search_intent
          writing_style
          writing_tone
          hidden_insight
          target_audience
          goal_of_article
          semantic_analysis_common_subtopics
          semantic_analysis_related_questions
          keywords_primary_keyword
          keywords_secondary_keywords
          keywords_semantic_keywords
          keywords_long_tail_keywords
          seo_completed_at
          new_title
          key_takeaways
          outline
          pre_blog_completed_at
          draft_markdown
          post_blog_completed_at
          featured_image_url
          image_completed_at
          blog_post_id
          publish_completed_at
          publish_updated_at
          last_error
          blog_categories
        }
      }
    `,
    variables: { id: Number(id) },
  })
  return data.data.streetLocation
}

export const addStreetLocation = async ({ postcode, street, suburb, neighbourhood, borough }) => {
  const input = { postcode, street }
  if (suburb) input.suburb = suburb
  if (neighbourhood) input.neighbourhood = neighbourhood
  if (borough) input.borough = borough
  const { data } = await streetLocationsClient.post('', {
    query: `
      mutation Add($input: AddStreetLocationInput!) {
        addStreetLocation(input: $input) {
          id
          prefix
          postcode
          street
          suburb
          neighbourhood
          borough
          created_at
        }
      }
    `,
    variables: { input },
  })
  return data.data.addStreetLocation
}

export const updateStreetLocationCoordinates = async (id, lat, lon) => {
  const { data } = await streetLocationsClient.post('', {
    query: `
      mutation UpdateStreetLocationCoordinates($input: UpdateStreetLocationCoordinatesInput!) {
        updateStreetLocationCoordinates(input: $input) {
          success
          rowsAffected
        }
      }
    `,
    variables: { input: { id: Number(id), lat, lon } },
  })
  return data.data.updateStreetLocationCoordinates
}

export const updateStreetLocationFields = async (id, fields) => {
  const { data } = await streetLocationsClient.post('', {
    query: `
      mutation UpdateStreetLocationFields($input: UpdateStreetLocationFieldsInput!) {
        updateStreetLocationFields(input: $input) {
          success
          rowsAffected
        }
      }
    `,
    variables: { input: { id: Number(id), ...fields } },
  })
  return data.data.updateStreetLocationFields
}

export const deleteStreetLocation = async (id) => {
  const { data } = await streetLocationsClient.post('', {
    query: `
      mutation DeleteStreetLocation($id: Int!) {
        deleteStreetLocation(id: $id) {
          success
          rowsAffected
        }
      }
    `,
    variables: { id: Number(id) },
  })
  return data.data.deleteStreetLocation
}

export const updateStreetLocationCustomAnchors = async (id, customAnchors) => {
  const { data } = await streetLocationsClient.post('', {
    query: `
      mutation UpdateCustomAnchors($input: StreetLocationCustomAnchorsInput!) {
        updateStreetLocationCustomAnchors(input: $input) {
          success
          rowsAffected
        }
      }
    `,
    variables: {
      input: {
        id: Number(id),
        custom_anchors: JSON.stringify(customAnchors),
      },
    },
  })
  return data.data.updateStreetLocationCustomAnchors
}

export const generatePhase = async (phase, ids) => {
  const { data } = await axios.post(`${N8N_STREET_PHASE_WEBHOOK_URL}/${phase}`, { ids })
  return data
}

export const generateAllPhases = async (ids) => {
  const { data } = await axios.post(N8N_STREET_ALL_PHASES_WEBHOOK_URL, { ids })
  return data
}

export const fetchBulkStatus = async (ids) => {
  const { data } = await streetLocationsClient.post('', {
    query: `
      query PendingJobs($ids: [Int!]!) {
        streetLocationJobsPendingByIds(ids: $ids) {
          id
          street_location_id
          phase
          status
          created_at
        }
      }
    `,
    variables: { ids: ids.map(Number) },
  })
  return data.data.streetLocationJobsPendingByIds
}
