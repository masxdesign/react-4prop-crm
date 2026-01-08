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
  useUpdateJobResultMutation
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
const buildRevisionArray = (originalContent, revisionHistory) => {
  const revisions = [
    { version: 0, content: originalContent, isOriginal: true, id: null }
  ];

  if (revisionHistory?.revisions) {
    revisionHistory.revisions
      .sort((a, b) => a.version - b.version)
      .forEach(rev => {
        revisions.push({
          version: rev.version,
          content: rev.new_content,
          feedback: rev.user_feedback,
          createdAt: rev.created_at,
          id: rev.id,
          isOriginal: false
        });
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
function RevisionNavigator({ total, currentIndex, onNavigate }) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  if (total <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={isFirst}
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
        disabled={isLast}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// RevisionField - encapsulates a single field with revision navigation
function RevisionField({
  label,
  fieldName,
  originalContent,
  revisionHistory,
  onRemix,
  onUpdate,
  isRemixing,
  minRows = 3
}) {
  // Build revision array (index 0 = original, 1+ = revisions)
  const revisions = useMemo(
    () => buildRevisionArray(originalContent, revisionHistory),
    [originalContent, revisionHistory]
  );

  // Track current revision index (default to latest)
  const [currentIndex, setCurrentIndex] = useState(revisions.length - 1);

  // Local editable state
  const [value, setValue] = useState('');

  // Update index when revisions change (new revision added)
  useEffect(() => {
    setCurrentIndex(revisions.length - 1);
  }, [revisions.length]);

  // Sync local state when navigating revisions
  useEffect(() => {
    setValue(revisions[currentIndex]?.content || '');
  }, [currentIndex, revisions]);

  // Get current revision info for API calls
  const currentRevision = revisions[currentIndex];
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
            onNavigate={setCurrentIndex}
          />
          <RemixPopover
            field={fieldName}
            revisionId={revisionInfo.revisionId}
            onRemix={onRemix}
            isLoading={isRemixing}
          />
        </div>
      </div>
      <AutoResizeTextarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onUpdate(fieldName, value, revisionInfo)}
        minRows={minRows}
      />
    </div>
  );
}

// Edit tab with revision navigation
function EditTab({ outputData, jobId, onRemix, onUpdate, isRemixing }) {
  const result = outputData?.output_data?.result || {};

  // Fetch revision history for each field
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
        isRemixing={isRemixing}
        minRows={3}
      />

      <RevisionField
        label="Description"
        fieldName="description"
        originalContent={result.description}
        revisionHistory={descHistory}
        onRemix={onRemix}
        onUpdate={onUpdate}
        isRemixing={isRemixing}
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
            isRemixing={createRemixMutation.isPending}
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
