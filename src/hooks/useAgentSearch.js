import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { searchAgents } from '@/components/Magazine/api';
import getAvatarImageUrl from '@/utils/getAvatarImageUrl';

/**
 * Custom hook for agent search with debouncing and data transformations
 * @param {string} searchTerm - The search term to query agents
 * @param {Object} options - Additional options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {number} options.minLength - Minimum search term length (default: 2)
 * @returns {Object} TanStack Query result with transformed agent data
 */
export const useAgentSearch = (searchTerm, options = {}) => {
  const { 
    debounceMs = 300, 
    minLength = 2,
    ...queryOptions 
  } = options;

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const query = useQuery({
    queryKey: ['agents', 'search', debouncedSearchTerm],
    queryFn: () => searchAgents(debouncedSearchTerm),
    enabled: !!debouncedSearchTerm && debouncedSearchTerm.length >= minLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions
  });

  // Transform raw agent data with computed fields
  const transformedData = useMemo(() => {
    if (!query.data) return [];
    
    return query.data.map(agent => ({
      ...agent,
      // Add computed avatar URL
      picture: getAvatarImageUrl(agent),
      // Add computed full name for easier display
      fullName: `${agent.firstname || ''} ${agent.surname || ''}`.trim(),
      // Add computed display name for search/filtering
      displayName: `${agent.firstname || ''} ${agent.surname || ''} ${agent.email || ''}`.toLowerCase()
    }));
  }, [query.data]);

  return {
    ...query,
    data: transformedData,
    // Convenience properties
    agents: transformedData,
    isSearching: query.isLoading,
    hasResults: transformedData.length > 0,
    // Search terms for reference
    searchTerm: debouncedSearchTerm,
    debouncedSearchTerm
  };
};

export default useAgentSearch;