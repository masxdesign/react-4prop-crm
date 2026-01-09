import { JobsList } from '@/components/JobCore';
import StreetPostJobOutputContent from './StreetPostJobOutputContent';
import { STREET_POST_JOB_CONFIG } from './streetPostConfig';

/**
 * Street-post specific wrapper for JobsList.
 * Configures the generic component with street-post job type config.
 */
export default function StreetPostJobsList({
  jobs = [],
  count = 0,
  totalCostUSD = 0,
  advertiserId,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage = null,
}) {
  return (
    <JobsList
      jobs={jobs}
      count={count}
      totalCostUSD={totalCostUSD}
      advertiserId={advertiserId}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      jobType="street_post"
      jobTypeConfig={STREET_POST_JOB_CONFIG}
      OutputContentComponent={StreetPostJobOutputContent}
    />
  );
}
