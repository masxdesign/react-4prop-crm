import propertyPubClient from "./propertyPubClient";

/**
 * Analyze keywords and get article topics
 * @param {string} seed - Base keyword to analyze
 * @param {object} params - Optional params { hl, gl, geo, timeframe }
 */
export const analyzeKeywords = async (seed, params = {}) => {
  const { data } = await propertyPubClient.get('/api/keywords/analyze', {
    params: { seed, ...params }
  });
  return data;
};

/**
 * Get keyword suggestions from autocomplete
 * @param {string} seed - Base keyword
 * @param {object} params - Optional params { hl, gl }
 */
export const fetchKeywordSuggestions = async (seed, params = {}) => {
  const { data } = await propertyPubClient.get('/api/keywords/suggest', {
    params: { seed, ...params }
  });
  return data;
};

/**
 * Get Google Trends data for keywords
 * @param {string[]} keywords - Keywords to get trends for
 * @param {object} params - Optional params { geo, hl, timeframe }
 */
export const fetchKeywordTrends = async (keywords, params = {}) => {
  const { data } = await propertyPubClient.get('/api/keywords/trends', {
    params: { keyword: keywords.join(','), ...params }
  });
  return data;
};

/**
 * Cluster keywords into topics
 * @param {string[]} keywords - Keywords to cluster
 * @param {object} options - Optional { threshold, minClusterSize }
 */
export const clusterKeywords = async (keywords, options = {}) => {
  const { data } = await propertyPubClient.post('/api/keywords/topics', {
    keywords,
    ...options
  });
  return data;
};

/**
 * AI-enhanced keyword analysis
 * @param {string} seed - Base keyword to analyze
 * @param {object} params - Optional params { hl, gl, geo, timeframe, provider, skipCache }
 */
export const analyzeKeywordsAI = async (seed, params = {}) => {
  const { data } = await propertyPubClient.get('/api/keywords/analyze-ai', {
    params: { seed, ...params }
  });
  return data;
};
