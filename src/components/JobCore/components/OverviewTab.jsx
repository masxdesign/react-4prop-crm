import { useMemo } from 'react';
import MarkdownSection from './MarkdownSection';
import { buildRevisionArray, findIndexByVersion } from '../utils';

// Get the content for a field based on selected version
function getSelectedContent(originalContent, revisionHistory) {
  const revisions = buildRevisionArray(originalContent, revisionHistory);
  const selectedVersion = revisionHistory?.selected_version;
  const currentIndex = findIndexByVersion(revisions, selectedVersion);
  const current = revisions[currentIndex];
  return current?.isPending ? originalContent : (current?.content || originalContent);
}

/** Preview tab showing selected versions with unsaved local edits. */
export default function OverviewTab({ outputData, fields, revisionHistories = {}, localEdits = {} }) {
  const result = outputData?.output_data?.result || {};

  // Build preview content using selected versions, with localEdits taking priority
  const previewContent = useMemo(() => {
    const content = {};
    for (const field of fields) {
      // Local edits take priority (unsaved changes)
      if (localEdits[field.name] !== undefined) {
        content[field.name] = localEdits[field.name];
        continue;
      }

      const originalContent = result[field.name] || '';
      const revisionHistory = revisionHistories[field.name];

      if (field.remixable && revisionHistory) {
        content[field.name] = getSelectedContent(originalContent, revisionHistory);
      } else {
        content[field.name] = originalContent;
      }
    }
    return content;
  }, [fields, result, revisionHistories, localEdits]);

  return (
    <div className="prose prose-sm max-w-none">
      {fields.map(field => (
        <MarkdownSection
          key={field.name}
          heading={field.previewHeading || field.label}
          content={previewContent[field.name]}
        />
      ))}
    </div>
  );
}
