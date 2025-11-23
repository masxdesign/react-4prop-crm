import { useQuery } from '@tanstack/react-query';
import { fetchUsersByNids } from '@/components/Magazine/api';

const useUsersByNids = (nids) => {
  // Filter out null/undefined NIDs and get unique values
  const uniqueNids = [...new Set(nids?.filter(Boolean) || [])];
  
  const {
    data: users = [],
    isLoading,
    error,
    ...queryResult
  } = useQuery({
    queryKey: ['users-by-nids', uniqueNids.sort()], // Sort for consistent cache key
    queryFn: () => fetchUsersByNids(uniqueNids),
    enabled: uniqueNids.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create a lookup map for O(1) access
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

  // Helper function to get user by NID
  const getUserByNid = (nid) => {
    if (!nid) return null;
    return userMap[nid] || null;
  };

  return {
    users,
    getUserByNid,
    userMap,
    isLoading,
    error,
    ...queryResult
  };
};

export default useUsersByNids;