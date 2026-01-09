import { JobOutputContent } from '@/components/JobCore';
import { useRelatedJobs } from '@/features/jobs/jobs.hooks';
import {
  STREET_POST_EDITABLE_FIELDS,
  STREET_POST_PREVIEW_FIELDS,
  STREET_POST_JOB_CONFIG
} from './streetPostConfig';

/**
 * Street-post specific wrapper for JobOutputContent.
 * Configures the generic component with street-post field schemas and related jobs.
 */
export default function StreetPostJobOutputContent({
  outputData,
  isLoading = false,
  job = null,
  advertiserId = null,
  onJobChange = null,
}) {
  const postcode = job?.input_data?.postcode;
  const street = job?.input_data?.street;

  // Fetch related jobs using street-post specific hook
  const { jobs: relatedJobs } = useRelatedJobs(postcode, street, advertiserId);

  return (
    <JobOutputContent
      outputData={outputData}
      isLoading={isLoading}
      job={job}
      onJobChange={onJobChange}
      editableFields={STREET_POST_EDITABLE_FIELDS}
      previewFields={STREET_POST_PREVIEW_FIELDS}
      jobType={STREET_POST_JOB_CONFIG.type}
      remixType={STREET_POST_JOB_CONFIG.remixType}
      relatedJobs={relatedJobs}
    />
  );
}
