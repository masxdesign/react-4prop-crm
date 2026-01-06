import { queryOptions } from '@tanstack/react-query';
import { fetchAgencyAdvertiserProperties, fetchAdvertiserAgencyProperties } from './api';

/**
 * Query options for fetching properties for a specific advertiser under an agency
 * Used in AgencyBreakdownTable when expanding an advertiser row
 */
export const agencyAdvertiserPropertiesQuery = (agencyId, advertiserId, startDate, endDate) =>
  queryOptions({
    queryKey: ['agency-advertiser-properties', agencyId, advertiserId, startDate, endDate],
    queryFn: () => fetchAgencyAdvertiserProperties(agencyId, advertiserId, startDate, endDate),
    enabled: !!agencyId && !!advertiserId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change frequently
  });

/**
 * Query options for fetching properties for a specific agency under an advertiser
 * Used in AdvertiserBreakdownTable when expanding an agency row
 */
export const advertiserAgencyPropertiesQuery = (advertiserId, agencyId, startDate, endDate) =>
  queryOptions({
    queryKey: ['advertiser-agency-properties', advertiserId, agencyId, startDate, endDate],
    queryFn: () => fetchAdvertiserAgencyProperties(advertiserId, agencyId, startDate, endDate),
    enabled: !!advertiserId && !!agencyId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change frequently
  });
