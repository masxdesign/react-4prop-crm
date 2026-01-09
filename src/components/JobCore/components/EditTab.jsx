import RevisionField from './RevisionField';

/** Renders editable fields with revision support based on field schema. */
export default function EditTab({
  outputData,
  fields,
  revisionHistories = {},
  onRemix,
  onUpdate,
  onVersionChange,
  onLocalEdit,
  localEdits = {}
}) {
  const result = outputData?.output_data?.result || {};

  return (
    <div className="space-y-6 p-1">
      {fields
        .filter(field => field.editable !== false)
        .map(field => (
          <RevisionField
            key={field.name}
            label={field.label}
            fieldName={field.name}
            originalContent={result[field.name]}
            revisionHistory={revisionHistories[field.name]}
            onRemix={field.remixable ? onRemix : undefined}
            onUpdate={onUpdate}
            onVersionChange={onVersionChange}
            onLocalEdit={onLocalEdit}
            localEditValue={localEdits[field.name]}
            minRows={field.minRows || 3}
          />
        ))}
    </div>
  );
}
