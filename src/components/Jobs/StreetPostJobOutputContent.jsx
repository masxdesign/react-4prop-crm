import { DraftOutputContent } from '@/components/JobCore';
import { useRelatedJobs } from '@/features/jobs/jobs.hooks';
import {
  STREET_POST_EDITABLE_FIELDS,
  STREET_POST_PREVIEW_FIELDS,
  STREET_POST_JOB_CONFIG
} from './streetPostConfig';

/**
 * Street-post specific wrapper for DraftOutputContent.
 * Uses the new draft/revision system for content editing.
 * Configures the generic component with street-post field schemas and related jobs.
 */
export default function StreetPostJobOutputContent({
  job = null,
  advertiserId = null,
  onJobChange = null,
  onSyncStatusChange = null,
  onPublishHandlersChange = null,
}) {
  const postcode = job?.input_data?.postcode;
  const street = job?.input_data?.street;

  // Fetch related jobs using street-post specific hook
  const { jobs: relatedJobs } = useRelatedJobs(postcode, street, advertiserId);

  return (
    <DraftOutputContent
      job={job}
      onJobChange={onJobChange}
      onSyncStatusChange={onSyncStatusChange}
      onPublishHandlersChange={onPublishHandlersChange}
      editableFields={STREET_POST_EDITABLE_FIELDS}
      previewFields={STREET_POST_PREVIEW_FIELDS}
      jobType={STREET_POST_JOB_CONFIG.type}
      remixType={STREET_POST_JOB_CONFIG.remixType}
      relatedJobs={relatedJobs}
    />
  );
}
