import { X } from 'lucide-react';
import { JOB_STATUS_CONFIG, formatRelativeTime, formatCostUSD } from '../utils';

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

function needsSync(job) {
  return job.blog_post_id &&
         job.is_published &&
         job.updated_at &&
         job.blog_synced_at &&
         new Date(job.updated_at) > new Date(job.blog_synced_at);
}

export default function JobItem({ job, onCancel, onClick, getTitle }) {
  const statusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const canCancel = job.status === 'pending' || job.status === 'running';
  const isClickable = job.status === 'completed';

  // Get title from config function or fallback to job id
  const title = getTitle ? getTitle(job) : job.id;

  // Blog status for completed jobs
  const blogStatus = job.status === 'completed' ? getBlogStatus(job) : null;
  const blogConfig = blogStatus ? BLOG_STATUS_CONFIG[blogStatus] : null;
  const showNeedsSync = job.status === 'completed' && needsSync(job);

  // Use total_cost_usd if available (includes remix costs), otherwise fall back to cost_usd
  const displayCost = job.total_cost_usd ?? job.cost_usd;

  return (
    <div
      className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${isClickable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
      onClick={isClickable ? () => onClick(job) : undefined}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
            <StatusIcon className={`h-3 w-3 ${statusConfig.spin ? 'animate-spin' : ''}`} />
            {statusConfig.label}
          </span>
          {blogConfig && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${blogConfig.className}`}>
              {blogConfig.label}
            </span>
          )}
          {showNeedsSync && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${BLOG_STATUS_CONFIG.needs_sync.className}`}>
              {BLOG_STATUS_CONFIG.needs_sync.label}
            </span>
          )}
          <span className="text-sm font-medium text-gray-900">
            {title}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Created {formatRelativeTime(job.created_at)}
          {job.completed_at && ` • Completed ${formatRelativeTime(job.completed_at)}`}
          {displayCost != null && (
            <span className="ml-2 text-emerald-600 font-medium">
              {formatCostUSD(displayCost)}
            </span>
          )}
        </div>
        {job.status === 'failed' && job.error_message && (
          <p className="text-xs text-red-600 mt-1">{job.error_message}</p>
        )}
      </div>
      {canCancel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel(job.id);
          }}
          className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          title="Cancel job"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
