import { useState, useEffect, useMemo, useRef } from 'react';
import AutoResizeTextarea from '@/components/ui-custom/AutoResizeTextarea';
import RemixPopover from '@/components/ui-custom/RemixPopover';
import Confetti from '@/components/ui-custom/Confetti';
import RevisionNavigator from './RevisionNavigator';
import SkeletonTextarea from './SkeletonTextarea';
import { buildRevisionArray, findIndexByVersion } from '../utils';

// RevisionField - encapsulates a single field with revision navigation
// currentIndex is derived from revisionHistory.selected_version (query cache)
export default function RevisionField({
  label,
  fieldName,
  originalContent,
  revisionHistory,
  onRemix,
  onUpdate,
  onVersionChange,
  onLocalEdit,
  localEditValue,
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
  const [showConfetti, setShowConfetti] = useState(false);
  const wasPendingRef = useRef(false);
  const lastSavedValueRef = useRef('');

  // Trigger confetti when pending state ends (remix completes)
  useEffect(() => {
    if (wasPendingRef.current && !hasPending) {
      setShowConfetti(true);
    }
    wasPendingRef.current = hasPending;
  }, [hasPending]);

  // Sync local state when currentIndex or revisions change
  // localEditValue takes priority (unsaved changes survive tab switches)
  useEffect(() => {
    const current = revisions[currentIndex];
    const serverContent = current && !current.isPending ? (current.content || '') : '';

    // If local edit exists and matches server content, clear it (save succeeded)
    if (localEditValue !== undefined && localEditValue === serverContent) {
      onLocalEdit?.(fieldName, undefined);
      setValue(serverContent);
      lastSavedValueRef.current = serverContent;
      return;
    }

    // Local edit takes priority over server content
    if (localEditValue !== undefined) {
      setValue(localEditValue);
      return;
    }

    // No local edit - use server content
    if (current && !current.isPending) {
      setValue(serverContent);
      lastSavedValueRef.current = serverContent;
    }
  }, [currentIndex, revisions, localEditValue, fieldName, onLocalEdit]);

  // Handle blur - only save if value changed
  const handleBlur = () => {
    if (value !== lastSavedValueRef.current) {
      lastSavedValueRef.current = value;
      onUpdate(fieldName, value, revisionInfo);
    }
  };

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
    <div className="space-y-2 relative">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} count={40} />
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <div className="flex items-center gap-2">
          <RevisionNavigator
            total={revisions.length}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
            disabled={hasPending}
          />
          {onRemix && (
            <RemixPopover
              field={fieldName}
              revisionId={revisionInfo.revisionId}
              onRemix={onRemix}
              isLoading={hasPending}
            />
          )}
        </div>
      </div>
      {isPendingSlide ? (
        <SkeletonTextarea minRows={minRows} />
      ) : (
        <AutoResizeTextarea
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            onLocalEdit?.(fieldName, newValue);
          }}
          onBlur={handleBlur}
          minRows={minRows}
        />
      )}
    </div>
  );
}
