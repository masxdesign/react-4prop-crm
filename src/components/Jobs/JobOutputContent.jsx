import { useState, useEffect, useMemo } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import RemixPopover from '@/components/ui-custom/RemixPopover';
import AutoResizeTextarea from '@/components/ui-custom/AutoResizeTextarea';
import {
  useRelatedJobs,
  useFieldRevisionHistory,
  useCreateRemixJobMutation,
  useUpdateRevisionMutation,
  useUpdateJobResultMutation,
  useUpdateSelectedVersionMutation
} from '@/features/jobs/jobs.hooks';
import { useAuth } from '@/components/Auth/Auth-context';

// Format relative time
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

// Format cost in USD
const formatCostUSD = (cost) => {
  if (cost == null) return '';
  return `$${cost.toFixed(4)}`;
};

// Build revision array from original content + revision history
// Backend includes pending placeholder when remix is in progress
const buildRevisionArray = (originalContent, revisionHistory) => {
  const revisions = [
    { version: 0, content: originalContent, isOriginal: true, id: null }
  ];

  if (revisionHistory?.revisions) {
    revisionHistory.revisions
      .sort((a, b) => {
        // Keep pending at the end
        if (a.version === 'pending') return 1;
        if (b.version === 'pending') return -1;
        return a.version - b.version;
      })
      .forEach(rev => {
        if (rev.is_pending) {
          // Pending revision from backend
          revisions.push({
            version: 'pending',
            content: '',
            isPending: true,
            id: null
          });
        } else {
          revisions.push({
            version: rev.version,
            content: rev.new_content,
            feedback: rev.user_feedback,
            createdAt: rev.created_at,
            id: rev.id,
            isOriginal: false
          });
        }
      });
  }

  return revisions;
};

// Markdown-style section renderer
function MarkdownSection({ heading, content }) {
  if (!content) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-1">
        {heading}
      </h2>
      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}

// Overview tab showing structured markdown-like content
function OverviewTab({ outputData }) {
  const result = outputData?.output_data?.result || {};

  return (
    <div className="prose prose-sm max-w-none">
      <MarkdownSection heading="Postcode" content={result.postcode} />
      <MarkdownSection heading="Street" content={result.street} />
      <MarkdownSection heading="Demographic" content={result.demographic} />
      <MarkdownSection heading="Description" content={result.description} />
    </div>
  );
}

// Raw JSON tab
function RawJsonTab({ outputData }) {
  return (
    <pre className="p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
      {JSON.stringify(outputData?.output_data, null, 2)}
    </pre>
  );
}

// Revision navigator (prev/next buttons)
function RevisionNavigator({ total, currentIndex, onNavigate, disabled = false }) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  if (total <= 1) return null;

  return (
    <div className={`flex items-center gap-1 ${disabled ? 'opacity-50' : ''}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={isFirst || disabled}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs text-gray-500 min-w-[40px] text-center">
        {currentIndex + 1} / {total}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={isLast || disabled}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Skeleton textarea for loading state
function SkeletonTextarea({ minRows = 3 }) {
  const height = minRows * 24 + 16; // Approximate height based on rows
  return (
    <div
      className="w-full rounded-md border border-gray-200 bg-gray-50 animate-pulse"
      style={{ height: `${height}px` }}
    >
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        {minRows > 3 && <div className="h-3 bg-gray-200 rounded w-2/3" />}
      </div>
    </div>
  );
}

// Helper to find index by version number
const findIndexByVersion = (revisions, version) => {
  if (version == null) return revisions.length - 1;
  const idx = revisions.findIndex(r => r.version === version);
  return idx >= 0 ? idx : revisions.length - 1;
};

// RevisionField - encapsulates a single field with revision navigation
// currentIndex is derived from revisionHistory.selected_version (query cache)
function RevisionField({
  label,
  fieldName,
  originalContent,
  revisionHistory,
  onRemix,
  onUpdate,
  onVersionChange,
  minRows = 3
}) {
  // Build revision array (index 0 = original, 1+ = revisions, pending from backend)
  const revisions = useMemo(
    () => buildRevisionArray(originalContent, revisionHistory),
    [originalContent, revisionHistory]
  );

  // Check if there's a pending revision (from backend)
  const hasPending = revisions.some(r => r.isPending);

  // Get selected version from query cache (backend response)
  const selectedVersion = revisionHistory?.selected_version;

  // Derive currentIndex from selected_version or show last slide if pending
  const currentIndex = useMemo(() => {
    if (hasPending) {
      // Show skeleton slide when remix is in progress
      return revisions.length - 1;
    }
    return findIndexByVersion(revisions, selectedVersion);
  }, [hasPending, revisions, selectedVersion]);

  // Local editable state
  const [value, setValue] = useState('');

  // Sync local state when currentIndex or revisions change
  useEffect(() => {
    const current = revisions[currentIndex];
    if (current && !current.isPending) {
      setValue(current.content || '');
    }
  }, [currentIndex, revisions]);

  // Handle navigation - persist to backend, which updates query cache on next poll
  const handleNavigate = (newIndex) => {
    const revision = revisions[newIndex];
    if (revision && !revision.isPending && onVersionChange) {
      onVersionChange(fieldName, revision.version);
    }
  };

  // Get current revision info for API calls
  const currentRevision = revisions[currentIndex];
  const isPendingSlide = currentRevision?.isPending;
  const revisionInfo = {
    isOriginal: currentRevision?.isOriginal ?? false,
    revisionId: currentRevision?.id ?? null
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <div className="flex items-center gap-2">
          <RevisionNavigator
            total={revisions.length}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
            disabled={hasPending}
          />
          <RemixPopover
            field={fieldName}
            revisionId={revisionInfo.revisionId}
            onRemix={onRemix}
            isLoading={hasPending}
          />
        </div>
      </div>
      {isPendingSlide ? (
        <SkeletonTextarea minRows={minRows} />
      ) : (
        <AutoResizeTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onUpdate(fieldName, value, revisionInfo)}
          minRows={minRows}
        />
      )}
    </div>
  );
}

// Edit tab with revision navigation
function EditTab({ outputData, jobId, onRemix, onUpdate, onVersionChange }) {
  const result = outputData?.output_data?.result || {};

  // Fetch revision history for each field (includes pending and selected_version from backend)
  const { data: demoHistory } = useFieldRevisionHistory(jobId, 'demographic');
  const { data: descHistory } = useFieldRevisionHistory(jobId, 'description');

  return (
    <div className="space-y-6 p-1">
      <RevisionField
        label="Demographic"
        fieldName="demographic"
        originalContent={result.demographic}
        revisionHistory={demoHistory}
        onRemix={onRemix}
        onUpdate={onUpdate}
        onVersionChange={onVersionChange}
        minRows={3}
      />

      <RevisionField
        label="Description"
        fieldName="description"
        originalContent={result.description}
        revisionHistory={descHistory}
        onRemix={onRemix}
        onUpdate={onUpdate}
        onVersionChange={onVersionChange}
        minRows={4}
      />
    </div>
  );
}

// Loading state
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
}

// Error state
function ErrorState({ message }) {
  return (
    <div className="p-4 bg-red-50 rounded-lg">
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );
}

// Empty state
function EmptyState() {
  return <p className="text-gray-400 text-sm">No output data available</p>;
}

// Dropdown for navigating between related jobs
function RelatedJobsDropdown({ jobs, currentJobId, onJobChange }) {
  if (!jobs || jobs.length <= 1) return null;

  return (
    <div className="mb-4">
      <Select value={currentJobId} onValueChange={onJobChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              <span className="flex items-center gap-2">
                <span>{formatRelativeTime(job.completed_at || job.created_at)}</span>
                {job.cost_usd != null && (
                  <span className="text-emerald-600">{formatCostUSD(job.cost_usd)}</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Displays job output with tabs. Usable in dialogs or standalone pages.
export default function JobOutputContent({
  outputData,
  isLoading = false,
  job = null,
  advertiserId = null,
  onJobChange = null,
}) {
  const auth = useAuth();
  const postcode = job?.input_data?.postcode;
  const street = job?.input_data?.street;

  const { jobs: relatedJobs } = useRelatedJobs(postcode, street, advertiserId);

  // Mutations
  const createRemixMutation = useCreateRemixJobMutation();
  const updateRevisionMutation = useUpdateRevisionMutation();
  const updateJobResultMutation = useUpdateJobResultMutation();
  const updateSelectedVersionMutation = useUpdateSelectedVersionMutation();

  const handleJobChange = (jobId) => {
    const selectedJob = relatedJobs.find((j) => j.id === jobId);
    if (selectedJob && onJobChange) {
      onJobChange(selectedJob);
    }
  };

  // Remix handler - creates a new remix job
  const handleRemix = (field, prompt, revisionId) => {
    createRemixMutation.mutate({
      originalJobId: job.id,
      fieldName: field,
      userFeedback: prompt,
      revisionId,
      createdBy: auth.user?.id
    });
  };

  // Update handler - updates original or revision content
  const handleUpdate = (field, value, revisionInfo) => {
    if (revisionInfo.isOriginal) {
      updateJobResultMutation.mutate({
        jobId: job.id,
        fieldName: field,
        content: value
      });
    } else {
      updateRevisionMutation.mutate({
        revisionId: revisionInfo.revisionId,
        content: value
      });
    }
  };

  // Version change handler - persists selected version to backend
  const handleVersionChange = (fieldName, version) => {
    if (job?.id) {
      updateSelectedVersionMutation.mutate({
        jobId: job.id,
        fieldName,
        version
      });
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (outputData?.error_message) {
    return <ErrorState message={outputData.error_message} />;
  }

  if (!outputData?.output_data) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      <RelatedJobsDropdown
        jobs={relatedJobs}
        currentJobId={job?.id}
        onJobChange={handleJobChange}
      />

      <Tabs defaultValue="edit" className="w-full">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <EditTab
            outputData={outputData}
            jobId={job?.id}
            onRemix={handleRemix}
            onUpdate={handleUpdate}
            onVersionChange={handleVersionChange}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <OverviewTab outputData={outputData} />
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <RawJsonTab outputData={outputData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
