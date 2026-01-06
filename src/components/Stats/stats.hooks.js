import { useQuery } from '@tanstack/react-query';
import { agencyAdvertiserPropertiesQuery, advertiserAgencyPropertiesQuery } from './stats.queries';

/**
 * Fetch properties for an advertiser under an agency (used in AgencyBreakdownTable)
 */
export const useAgencyAdvertiserProperties = (
  agencyId,
  advertiserId,
  startDate,
  endDate,
  options = {}
) => {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    ...agencyAdvertiserPropertiesQuery(agencyId, advertiserId, startDate, endDate),
    enabled: enabled && !!agencyId && !!advertiserId && !!startDate && !!endDate,
    ...queryOptions,
  });
};

/**
 * Fetch properties for an agency under an advertiser (used in AdvertiserBreakdownTable)
 */
export const useAdvertiserAgencyProperties = (
  advertiserId,
  agencyId,
  startDate,
  endDate,
  options = {}
) => {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    ...advertiserAgencyPropertiesQuery(advertiserId, agencyId, startDate, endDate),
    enabled: enabled && !!advertiserId && !!agencyId && !!startDate && !!endDate,
    ...queryOptions,
  });
};
