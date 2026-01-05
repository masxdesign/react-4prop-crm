import { useState } from 'react';
import { Clock, Loader2, CheckCircle, XCircle, Ban, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useJobOutput } from '@/features/jobs/jobs.hooks';
import JobOutputContent from './JobOutputContent';

const JOB_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  running: {
    label: 'Running',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Loader2,
    spin: true,
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Ban,
  },
};

const formatCostUSD = (cost) => {
  if (cost == null) return null;
  return `$${cost.toFixed(4)}`;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

function JobItem({ job, onCancel, onClick }) {
  const statusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const canCancel = job.status === 'pending' || job.status === 'running';
  const isClickable = job.status === 'completed';

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
          <span className="text-sm font-medium text-gray-900">
            {job.input_data?.postcode} - {job.input_data?.street}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Created {formatRelativeTime(job.created_at)}
          {job.completed_at && ` • Completed ${formatRelativeTime(job.completed_at)}`}
          {job.cost_usd != null && (
            <span className="ml-2 text-emerald-600 font-medium">
              {formatCostUSD(job.cost_usd)}
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

function JobOutputDialog({ jobId, job, advertiserId, open, onOpenChange, onJobChange }) {
  const { data: outputData, isLoading } = useJobOutput(open ? jobId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Job Output: {job?.input_data?.postcode} - {job?.input_data?.street}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <JobOutputContent
            outputData={outputData}
            isLoading={isLoading}
            job={job}
            advertiserId={advertiserId}
            onJobChange={onJobChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function JobsList({ jobs = [], count = 0, totalCostUSD = 0, advertiserId, onCancelJob }) {
  const [selectedJob, setSelectedJob] = useState(null);

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleCloseDialog = () => {
    setSelectedJob(null);
  };

  const handleJobChange = (job) => {
    setSelectedJob(job);
  };

  return (
    <>
      <div className="border-2 border-gray-300 rounded-xl bg-white mt-6">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-sm text-gray-500">
            {count} street post job{count !== 1 ? 's' : ''}
          </span>
          {totalCostUSD > 0 && (
            <span className="text-sm text-emerald-600 font-medium">
              Total: {formatCostUSD(totalCostUSD)}
            </span>
          )}
        </div>

        <div className="p-4 space-y-2 max-h-[600px] overflow-auto">
          {!jobs.length ? (
            <p className="text-gray-400 text-sm">No jobs yet</p>
          ) : (
            jobs.map((job) => (
              <JobItem
                key={job.id}
                job={job}
                onCancel={onCancelJob}
                onClick={handleJobClick}
              />
            ))
          )}
        </div>
      </div>

      <JobOutputDialog
        jobId={selectedJob?.id}
        job={selectedJob}
        advertiserId={advertiserId}
        open={!!selectedJob}
        onOpenChange={(open) => !open && handleCloseDialog()}
        onJobChange={handleJobChange}
      />
    </>
  );
}
