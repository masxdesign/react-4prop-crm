import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/Auth/Auth-context';
import {
  useFieldRevisionHistory,
  useCreateRemixJobMutation,
  useUpdateRevisionMutation,
  useUpdateJobResultMutation,
  useUpdateSelectedVersionMutation
} from '@/features/jobCore';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  RelatedJobsDropdown,
  EditTab,
  OverviewTab,
  RawJsonTab
} from './components';

/** Generic job output viewer with tabs for Edit, Preview, and Raw JSON. */
export default function JobOutputContent({
  outputData,
  isLoading = false,
  job = null,
  onJobChange = null,
  editableFields = [],
  previewFields = null,
  jobType = 'street_post',
  remixType = 'street_post_remix',
  relatedJobs = [],
}) {
  const auth = useAuth();

  // Local edits state - tracks unsaved changes for immediate preview
  const [localEdits, setLocalEdits] = useState({});

  // Get revision histories for all remixable fields
  const revisionHistories = {};
  for (const field of editableFields.filter(f => f.remixable)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useFieldRevisionHistory(job?.id, field.name);
    revisionHistories[field.name] = data;
  }

  // Mutations
  const createRemixMutation = useCreateRemixJobMutation(remixType, jobType);
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

  // Local edit handler - tracks unsaved changes for immediate preview
  const handleLocalEdit = (field, value) => {
    setLocalEdits(prev => ({ ...prev, [field]: value }));
  };

  // Update handler - updates original or revision content
  // Note: We don't clear localEdits here - they persist until revision data refreshes
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

  // Use previewFields if provided, otherwise use editableFields
  const fieldsForPreview = previewFields || editableFields;

  return (
    <div className="w-full">
      <RelatedJobsDropdown
        jobs={relatedJobs}
        currentJobId={job?.id}
        onJobChange={handleJobChange}
      />

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="h-7 p-0.5 gap-0.5">
          <TabsTrigger value="edit" className="h-6 px-2 text-xs">Edit</TabsTrigger>
          <TabsTrigger value="preview" className="h-6 px-2 text-xs">Preview</TabsTrigger>
          <TabsTrigger value="raw" className="h-6 px-2 text-xs">Raw JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <EditTab
            outputData={outputData}
            fields={editableFields}
            revisionHistories={revisionHistories}
            onRemix={handleRemix}
            onUpdate={handleUpdate}
            onVersionChange={handleVersionChange}
            onLocalEdit={handleLocalEdit}
            localEdits={localEdits}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <OverviewTab outputData={outputData} fields={fieldsForPreview} revisionHistories={revisionHistories} localEdits={localEdits} />
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <RawJsonTab outputData={outputData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
