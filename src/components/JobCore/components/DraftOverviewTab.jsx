import { useMemo } from 'react';
import MarkdownSection from './MarkdownSection';
import PreviewMap from './PreviewMap';
import { getDraftSelectedContent } from '../utils';

/**
 * Preview tab showing selected versions of draft content with unsaved local edits.
 */
export default function DraftOverviewTab({
  draft,
  fields,
  revisionHistories = {},
  localEdits = {},
  job = null
}) {
  // Build preview content using selected versions, with localEdits taking priority
  const previewContent = useMemo(() => {
    const content = {};
    for (const field of fields) {
      // Local edits take priority (unsaved changes)
      if (localEdits[field.name] !== undefined) {
        content[field.name] = localEdits[field.name];
        continue;
      }

      // Check if this is an input field from the job (not in draft)
      if (field.name === 'postcode' || field.name === 'street') {
        content[field.name] = job?.input_data?.[field.name] || '';
        continue;
      }

      // Get content from draft and revision history
      const draftContent = draft?.[field.name] || '';
      const revisionHistory = revisionHistories[field.name];

      content[field.name] = getDraftSelectedContent(draftContent, revisionHistory);
    }
    return content;
  }, [fields, draft, job, revisionHistories, localEdits]);

  return (
    <div className="space-y-4">
      {fields.map(field => {
        const content = previewContent[field.name];

        // Title displays as h1 without label
        if (field.displayType === 'title') {
          return (
            <h1 key={field.name} className="text-2xl font-bold text-gray-900 leading-tight">
              {content || 'Untitled'}
            </h1>
          );
        }

        // Map displays as read-only map without label
        if (field.displayType === 'map') {
          return (
            <PreviewMap key={field.name} value={content} height={360} />
          );
        }

        // Default: markdown section with heading
        return (
          <MarkdownSection
            key={field.name}
            heading={field.previewHeading || field.label}
            content={content}
          />
        );
      })}
    </div>
  );
}
