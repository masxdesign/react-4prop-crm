import { useState, useRef, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2, Search } from 'lucide-react';
import { useJobOutput, usePublishJobMutation } from '@/features/jobCore';
import { JOB_STATUS_CONFIG, formatRelativeTime, formatCostUSD } from './utils';
import { JobOutputDialog } from './components';

// Filter options for the job list
const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'failed', label: 'Failed' },
  { id: 'not_posted', label: 'Not posted' },
  { id: 'published', label: 'Published' },
  { id: 'unpublished', label: 'Unpublished' },
];

// Blog status badge configuration
const BLOG_STATUS_CONFIG = {
  not_posted: {
    label: 'Not posted',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  published: {
    label: 'Published',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  unpublished: {
    label: 'Unpublished',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  needs_sync: {
    label: 'Needs sync',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

function getBlogStatus(job) {
  if (!job.blog_post_id) return 'not_posted';
  return job.is_published ? 'published' : 'unpublished';
}

function needsSyncCheck(job) {
  return job.blog_post_id &&
         job.is_published &&
         job.updated_at &&
         job.blog_synced_at &&
         new Date(job.updated_at) > new Date(job.blog_synced_at);
}

/**
 * Generic JobsList component with virtualized infinite scroll and output dialog.
 */
export default function JobsList({
  jobs = [],
  count = 0,
  totalCostUSD = 0,
  advertiserId,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage = null,
  jobType,
  jobTypeConfig = {},
  OutputContentComponent,
  outputContentProps = {},
  resetFilterTrigger = 0,
}) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const parentRef = useRef(null);

  // Reset filter to 'all' when resetFilterTrigger changes
  useEffect(() => {
    if (resetFilterTrigger > 0) {
      setActiveFilter('all');
    }
  }, [resetFilterTrigger]);

  const {
    displayName = 'job',
    pluralName = 'jobs',
    getTitle = (job) => job.id,
    getDescription = () => 'View and edit job output',
  } = jobTypeConfig;

  // Filter jobs based on search query and active filter
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search filter - match title
      const title = getTitle ? getTitle(job) : job.id;
      const matchesSearch = !searchQuery ||
        String(title).toLowerCase().includes(searchQuery.toLowerCase());

      // Status/blog filter
      let matchesFilter = true;
      if (activeFilter !== 'all') {
        if (activeFilter === 'failed') {
          matchesFilter = job.status === 'failed';
        } else {
          // Blog status filters only apply to completed jobs
          if (job.status !== 'completed') {
            matchesFilter = false;
          } else {
            const blogStatus = getBlogStatus(job);
            matchesFilter = blogStatus === activeFilter;
          }
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [jobs, searchQuery, activeFilter, getTitle]);

  // Virtualizer for jobs
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? filteredJobs.length + 1 : filteredJobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 5,
  });

  // Fetch next page when scrolled to bottom
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= filteredJobs.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage &&
      fetchNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    filteredJobs.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  const handleJobClick = (job) => {
    if (job.status === 'completed') {
      setSelectedJob(job);
    }
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
  const publishMutation = usePublishJobMutation(jobType);

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
        {/* Search and filters header */}
        <div className="flex items-center gap-3 p-4 border-b">
          {/* Search input */}
          <div className="relative flex-shrink-0 w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Count and total */}
          <span className="text-sm text-gray-500">
            {filteredJobs.length}{filteredJobs.length !== count ? `/${count}` : ''} {count !== 1 ? pluralName : displayName}
          </span>
          {totalCostUSD > 0 && (
            <span className="text-sm text-emerald-600 font-medium">
              Total: {formatCostUSD(totalCostUSD)}
            </span>
          )}
        </div>

        {!filteredJobs.length ? (
          <div className="p-4">
            <p className="text-gray-400 text-sm">
              {jobs.length === 0
                ? `No ${pluralName} yet`
                : `No ${pluralName} match the current filters`}
            </p>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="max-h-[400px] overflow-auto"
          >
            {/* Sticky header row */}
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50 sticky top-0 z-10">
              <div className="w-[100px] text-xs font-medium text-gray-500">Status</div>
              <div className="flex-1 min-w-[150px] text-xs font-medium text-gray-500">Title</div>
              <div className="w-[100px] text-xs font-medium text-gray-500">Blog</div>
              <div className="w-[140px] text-xs font-medium text-gray-500">Created</div>
              <div className="w-[80px] text-xs font-medium text-gray-500 text-right">Cost</div>
            </div>

            {/* Virtualized rows */}
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const isLoaderRow = virtualRow.index > filteredJobs.length - 1;
                const job = filteredJobs[virtualRow.index];

                if (isLoaderRow) {
                  return (
                    <div
                      key="loader"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="flex items-center justify-center"
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  );
                }

                const statusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                const isClickable = job.status === 'completed';
                const title = getTitle ? getTitle(job) : job.id;
                const blogStatus = job.status === 'completed' ? getBlogStatus(job) : null;
                const blogConfig = blogStatus ? BLOG_STATUS_CONFIG[blogStatus] : null;
                const showNeedsSync = job.status === 'completed' && needsSyncCheck(job);
                const displayCost = job.total_cost_usd ?? job.cost_usd;

                return (
                  <div
                    key={job.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={`flex items-center gap-2 px-4 border-b ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={() => handleJobClick(job)}
                  >
                    {/* Status */}
                    <div className="w-[100px]">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                        <StatusIcon className={`h-3 w-3 ${statusConfig.spin ? 'animate-spin' : ''}`} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-[150px]">
                      <span className="text-sm font-medium text-gray-900 truncate block">
                        {title}
                      </span>
                      {job.status === 'failed' && job.error_message && (
                        <p className="text-xs text-red-600 truncate">{job.error_message}</p>
                      )}
                    </div>

                    {/* Blog Status */}
                    <div className="w-[100px] flex items-center gap-1">
                      {blogConfig && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${blogConfig.className}`}>
                          {blogConfig.label}
                        </span>
                      )}
                      {showNeedsSync && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${BLOG_STATUS_CONFIG.needs_sync.className}`}>
                          !
                        </span>
                      )}
                    </div>

                    {/* Created */}
                    <div className="w-[140px]">
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(job.created_at)}
                      </span>
                    </div>

                    {/* Cost */}
                    <div className="w-[80px] text-right">
                      {displayCost != null && (
                        <span className="text-xs text-emerald-600 font-medium">
                          {formatCostUSD(displayCost)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
