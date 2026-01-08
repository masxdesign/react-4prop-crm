import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RemixPopover from '@/components/ui-custom/RemixPopover';
import AutoResizeTextarea from '@/components/ui-custom/AutoResizeTextarea';
import { useRelatedJobs } from '@/features/jobs/jobs.hooks';

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

// Edit tab with editable textareas and AI rewrite buttons
function EditTab({ outputData, onRemix, onUpdate }) {
  const result = outputData?.output_data?.result || {};
  const [demographic, setDemographic] = useState(result.demographic || '');
  const [description, setDescription] = useState(result.description || '');

  const handleBlur = (field, value) => {
    onUpdate(field, value);
  };

  return (
    <div className="space-y-6 p-1">
      {/* Demographic field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900">Demographic</label>
          <RemixPopover field="demographic" onRemix={onRemix} />
        </div>
        <AutoResizeTextarea
          value={demographic}
          onChange={(e) => setDemographic(e.target.value)}
          onBlur={() => handleBlur('demographic', demographic)}
          minRows={3}
        />
      </div>

      {/* Description field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900">Description</label>
          <RemixPopover field="description" onRemix={onRemix} />
        </div>
        <AutoResizeTextarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => handleBlur('description', description)}
          minRows={4}
        />
      </div>
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
  const postcode = job?.input_data?.postcode;
  const street = job?.input_data?.street;

  const { jobs: relatedJobs } = useRelatedJobs(postcode, street, advertiserId);

  const handleJobChange = (jobId) => {
    const selectedJob = relatedJobs.find((j) => j.id === jobId);
    if (selectedJob && onJobChange) {
      onJobChange(selectedJob);
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

  // Placeholder remix handler - backend integration later
  const handleRemix = (field, prompt) => {
    console.log('Remix requested:', { field, prompt, job });
    // TODO: Call API endpoint to create remix job
  };

  // Placeholder update handler - backend integration later
  const handleUpdate = (field, value) => {
    console.log('Update requested:', { field, value, job });
    // TODO: Call API endpoint to update field
  };

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
          <EditTab outputData={outputData} onRemix={handleRemix} onUpdate={handleUpdate} />
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
