import DraftRevisionField from './DraftRevisionField';

/**
 * Renders editable fields for draft content with revision support.
 * Uses draft content directly instead of job output_data.
 */
export default function DraftEditTab({
  draft,
  fields,
  revisionHistories = {},
  onRemix,
  onUpdate,
  onVersionChange,
  onLocalEdit,
  localEdits = {}
}) {
  return (
    <div className="space-y-6 p-1">
      {fields
        .filter(field => field.editable !== false)
        .map(field => (
          <DraftRevisionField
            key={field.name}
            label={field.label}
            fieldName={field.name}
            draftContent={draft?.[field.name]}
            revisionHistory={revisionHistories[field.name]}
            onRemix={field.remixable ? onRemix : undefined}
            onUpdate={onUpdate}
            onVersionChange={onVersionChange}
            onLocalEdit={onLocalEdit}
            localEditValue={localEdits[field.name]}
            minRows={field.minRows || 3}
            inputType={field.inputType}
          />
        ))}
    </div>
  );
}
