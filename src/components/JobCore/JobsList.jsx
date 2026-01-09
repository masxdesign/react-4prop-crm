import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useJobOutput, usePublishJobMutation } from '@/features/jobCore';
import { formatCostUSD } from './utils';
import { JobItem, JobOutputDialog } from './components';

/**
 * Generic JobsList component with infinite scroll and output dialog.
 *
 * @param {Object} props
 * @param {Array} props.jobs - Array of job objects
 * @param {number} props.count - Total count of jobs
 * @param {number} props.totalCostUSD - Total cost in USD
 * @param {string} props.advertiserId - Advertiser ID
 * @param {Function} props.onCancelJob - Cancel job callback
 * @param {boolean} props.hasNextPage - Whether there are more pages
 * @param {boolean} props.isFetchingNextPage - Whether fetching next page
 * @param {Function} props.fetchNextPage - Fetch next page callback
 * @param {Object} props.jobTypeConfig - Job type configuration
 * @param {string} props.jobTypeConfig.displayName - Human-readable name (e.g., 'street post')
 * @param {string} props.jobTypeConfig.pluralName - Plural name (e.g., 'street post jobs')
 * @param {Function} props.jobTypeConfig.getTitle - Function to get job title from job object
 * @param {Function} props.jobTypeConfig.getDescription - Function to get job description
 * @param {React.ComponentType} props.OutputContentComponent - Component to render job output content
 * @param {Object} props.outputContentProps - Additional props to pass to OutputContentComponent
 */
export default function JobsList({
  jobs = [],
  count = 0,
  totalCostUSD = 0,
  advertiserId,
  onCancelJob,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage = null,
  jobTypeConfig = {},
  OutputContentComponent,
  outputContentProps = {},
}) {
  const [selectedJob, setSelectedJob] = useState(null);
  const sentinelRef = useRef(null);

  const {
    displayName = 'job',
    pluralName = 'jobs',
    getTitle = (job) => job.id,
    getDescription = () => 'View and edit job output',
  } = jobTypeConfig;

  // Intersection observer for auto-loading
  useEffect(() => {
    if (!fetchNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleCloseDialog = () => {
    setSelectedJob(null);
  };

  const handleJobChange = (job) => {
    setSelectedJob(job);
  };

  // Fetch job output for selected job
  const { data: outputData, isLoading: isLoadingOutput } = useJobOutput(selectedJob?.id);

  // Publish mutation
  const publishMutation = usePublishJobMutation();

  const handlePush = () => {
    if (selectedJob?.id) {
      publishMutation.mutate({ jobId: selectedJob.id });
    }
  };

  const handleUnpublish = () => {
    if (selectedJob?.id) {
      publishMutation.mutate({ jobId: selectedJob.id, unpublish: true });
    }
  };

  // handlePublish re-publishes an unpublished blog post (same as push but semantically different)
  const handlePublish = () => {
    if (selectedJob?.id) {
      publishMutation.mutate({ jobId: selectedJob.id });
    }
  };

  const blogPostId = outputData?.output_data?.result?.blog_post_id;
  const isPublished = outputData?.output_data?.result?.is_published === 'true';
  const blogSyncedAt = outputData?.output_data?.result?.blog_synced_at;
  const jobUpdatedAt = outputData?.updated_at;
  const needsSync = blogPostId && jobUpdatedAt && blogSyncedAt && new Date(jobUpdatedAt) > new Date(blogSyncedAt);

  return (
    <>
      <div className="border-2 border-gray-300 rounded-xl bg-white mt-6">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-sm text-gray-500">
            {count} {count !== 1 ? pluralName : displayName}
          </span>
          {totalCostUSD > 0 && (
            <span className="text-sm text-emerald-600 font-medium">
              Total: {formatCostUSD(totalCostUSD)}
            </span>
          )}
        </div>

        <div className="p-4 space-y-2 max-h-[400px] overflow-auto">
          {!jobs.length ? (
            <p className="text-gray-400 text-sm">No {pluralName} yet</p>
          ) : (
            <>
              {jobs.map((job) => (
                <JobItem
                  key={job.id}
                  job={job}
                  onCancel={onCancelJob}
                  onClick={handleJobClick}
                  getTitle={getTitle}
                />
              ))}
              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-1" />
              {isFetchingNextPage && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <JobOutputDialog
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => !open && handleCloseDialog()}
        getTitle={getTitle}
        getDescription={getDescription}
        blogPostId={blogPostId}
        isPublished={isPublished}
        needsSync={needsSync}
        onPush={handlePush}
        onUnpublish={handleUnpublish}
        onPublish={handlePublish}
        isPublishing={publishMutation.isPending}
      >
        {OutputContentComponent && (
          <OutputContentComponent
            outputData={outputData}
            isLoading={isLoadingOutput}
            job={selectedJob}
            advertiserId={advertiserId}
            onJobChange={handleJobChange}
            {...outputContentProps}
          />
        )}
      </JobOutputDialog>
    </>
  );
}
