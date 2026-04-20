import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/Auth/Auth-context';
import { useCreateRemixJobMutation } from '@/features/jobCore';
import {
  useDraftByJobId,
  useDraftRevisionHistory,
  useUpdateDraftFieldMutation,
  useSelectDraftRevisionMutation,
  usePublishDraftMutation,
  useDraftRemixJobsInProgress
} from '@/features/draft';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  RelatedJobsDropdown,
  RawJsonTab
} from './components';
import DraftEditTab from './components/DraftEditTab';
import DraftOverviewTab from './components/DraftOverviewTab';

/**
 * Draft-based output viewer with tabs for Edit, Preview, and Raw JSON.
 * Uses the new draft/revision system instead of job output_data.
 */
export default function DraftOutputContent({
  job = null,
  onJobChange = null,
  onSyncStatusChange = null,
  onPublishHandlersChange = null,
  editableFields = [],
  previewFields = null,
  jobType = 'street_post',
  remixType = 'street_post_remix',
  relatedJobs = [],
}) {
  const auth = useAuth();
  const queryClient = useQueryClient();

  // Fetch draft by job ID
  const { data: draft, isLoading: draftLoading, error: draftError } = useDraftByJobId(job?.id);

  // Local edits state - tracks unsaved changes for immediate preview
  const [localEdits, setLocalEdits] = useState({});

  // Get revision histories for all editable fields
  const revisionHistories = {};
  for (const field of editableFields) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useDraftRevisionHistory(draft?.id, field.name);
    revisionHistories[field.name] = data;
  }

  // Track remix job completion
  useDraftRemixJobsInProgress(remixType, job?.id, draft?.id);

  // Mutations
  const createRemixMutation = useCreateRemixJobMutation(remixType, jobType);
  const updateFieldMutation = useUpdateDraftFieldMutation(jobType);
  const selectRevisionMutation = useSelectDraftRevisionMutation(jobType);
  const publishMutation = usePublishDraftMutation(jobType);

  // Report draft sync status to parent (for sheet header badges)
  // sync_status can be: 'draft', 'published', 'modified', 'unpublished'
  // 'modified' means it's published but has unsaved changes that need syncing
  useEffect(() => {
    if (onSyncStatusChange && draft) {
      onSyncStatusChange({
        blogPostId: draft.blog_post_id,
        syncStatus: draft.sync_status,
        blogSyncedAt: draft.blog_synced_at
      });
    }
  }, [draft?.blog_post_id, draft?.sync_status, draft?.blog_synced_at, onSyncStatusChange]);

  // Provide publish handlers to parent (for sheet header actions)
  useEffect(() => {
    if (onPublishHandlersChange && draft?.id) {
      onPublishHandlersChange({
        onPublish: () => publishMutation.mutate({ draftId: draft.id, sourceJobId: job?.id }),
        onPush: () => publishMutation.mutate({ draftId: draft.id, sourceJobId: job?.id }),
        onUnpublish: () => publishMutation.mutate({ draftId: draft.id, sourceJobId: job?.id, unpublish: true }),
        isPublishing: publishMutation.isPending
      });
    }
  }, [draft?.id, job?.id, publishMutation, onPublishHandlersChange]);

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
    }, {
      onSuccess: () => {
        // Invalidate revision queries to fetch pending placeholder
        if (draft?.id) {
          queryClient.invalidateQueries({ queryKey: ["draft", draft.id, "revisions", field] });
        }
      }
    });
  };

  // Local edit handler - tracks unsaved changes for immediate preview
  const handleLocalEdit = (field, value) => {
    setLocalEdits(prev => ({ ...prev, [field]: value }));
  };

  // Update handler - creates new revision for the field
  const handleUpdate = (field, value, revisionInfo) => {
    if (!draft?.id) return;

    updateFieldMutation.mutate({
      draftId: draft.id,
      fieldName: field,
      content: value,
      createdBy: auth.user?.id,
      sourceJobId: job?.id
    });
  };

  // Version change handler - select a specific revision
  const handleVersionChange = (fieldName, version) => {
    if (!draft?.id) return;

    // Find the revision ID for this version
    const history = revisionHistories[fieldName];
    const revision = history?.revisions?.find(r => r.version === version);

    if (revision?.id) {
      selectRevisionMutation.mutate({
        draftId: draft.id,
        fieldName,
        revisionId: revision.id,
        sourceJobId: job?.id
      });
    }
  };

  if (draftLoading) {
    return <LoadingState />;
  }

  if (draftError) {
    return <ErrorState message={draftError.message || 'Failed to load draft'} />;
  }

  if (!draft) {
    return <EmptyState message="No draft found for this job" />;
  }

  // Use previewFields if provided, otherwise use editableFields
  const fieldsForPreview = previewFields || editableFields;

  // Build output-like structure for compatibility with existing components
  const draftAsOutput = {
    output_data: {
      ...draft,
      // Include job input_data for preview (postcode, street)
      postcode: job?.input_data?.postcode,
      street: job?.input_data?.street,
    },
    updated_at: draft.updated_at
  };

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
          <DraftEditTab
            draft={draft}
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
          <DraftOverviewTab
            draft={draft}
            fields={fieldsForPreview}
            revisionHistories={revisionHistories}
            localEdits={localEdits}
            job={job}
          />
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <RawJsonTab outputData={draftAsOutput} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
