import { useState, useEffect, useMemo, useRef } from 'react';
import AutoResizeTextarea from '@/components/ui-custom/AutoResizeTextarea';
import RemixPopover from '@/components/ui-custom/RemixPopover';
import Confetti from '@/components/ui-custom/Confetti';
import RevisionNavigator from './RevisionNavigator';
import SkeletonTextarea from './SkeletonTextarea';
import CoordinatePickerMap from './CoordinatePickerMap';
import { buildDraftRevisionArray, findDraftIndexByVersion } from '../utils';

/**
 * DraftRevisionField - field with revision navigation for draft content
 * In the draft system, all content exists as revisions (no separate "original")
 * Version 1 = first revision created when the job completed
 */
export default function DraftRevisionField({
  label,
  fieldName,
  draftContent,
  revisionHistory,
  onRemix,
  onUpdate,
  onVersionChange,
  onLocalEdit,
  localEditValue,
  minRows = 3,
  inputType = 'textarea'
}) {
  // Build revision array (no version 0, all versions are revisions)
  const revisions = useMemo(
    () => buildDraftRevisionArray(revisionHistory),
    [revisionHistory]
  );

  // Check if there's a pending revision
  const hasPending = revisions.some(r => r.isPending);

  // Get selected version from query cache (backend response)
  const selectedVersion = revisionHistory?.selected_version;

  // Derive currentIndex from selected_version or show last slide if pending
  const currentIndex = useMemo(() => {
    if (hasPending) {
      // Show skeleton slide when remix is in progress
      return revisions.length - 1;
    }
    return findDraftIndexByVersion(revisions, selectedVersion);
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
    // Use revision content, fallback to draft content if no revisions
    const serverContent = current && !current.isPending
      ? (current.content || '')
      : (draftContent || '');

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
    if (!current?.isPending) {
      setValue(serverContent);
      lastSavedValueRef.current = serverContent;
    }
  }, [currentIndex, revisions, localEditValue, fieldName, onLocalEdit, draftContent]);

  // Find if content matches any existing revision (returns revision or null)
  const findMatchingRevision = (content) => {
    return revisions.find(r => !r.isPending && r.content === content) || null;
  };

  // Smart save: if content matches an existing revision, select it instead of creating duplicate
  const handleSmartSave = (newValue) => {
    if (newValue === lastSavedValueRef.current) return;

    const matchingRevision = findMatchingRevision(newValue);
    if (matchingRevision && onVersionChange) {
      // Content matches existing revision - just select it
      lastSavedValueRef.current = newValue;
      onLocalEdit?.(fieldName, undefined); // Clear local edit
      onVersionChange(fieldName, matchingRevision.version);
    } else {
      // New content - save to server
      lastSavedValueRef.current = newValue;
      onUpdate(fieldName, newValue, revisionInfo);
    }
  };

  // Handle blur - smart save
  const handleBlur = () => {
    handleSmartSave(value);
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

  // If no revisions exist yet, show empty state
  const hasRevisions = revisions.length > 0;

  return (
    <div className="space-y-2 relative">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} count={40} />
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <div className="flex items-center gap-2">
          {hasRevisions && (
            <RevisionNavigator
              total={revisions.length}
              currentIndex={currentIndex}
              onNavigate={handleNavigate}
              disabled={hasPending}
            />
          )}
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
        <SkeletonTextarea minRows={inputType === 'input' || inputType === 'map' ? 1 : minRows} />
      ) : inputType === 'map' ? (
        <CoordinatePickerMap
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            onLocalEdit?.(fieldName, newValue);
          }}
          onSave={(newValue) => {
            // Smart save: check for matching revision first
            handleSmartSave(newValue);
          }}
          disabled={false}
          height={200}
        />
      ) : inputType === 'input' ? (
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            onLocalEdit?.(fieldName, newValue);
          }}
          onBlur={handleBlur}
          placeholder={!hasRevisions ? `No content yet for ${label.toLowerCase()}` : undefined}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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
          placeholder={!hasRevisions ? `No content yet for ${label.toLowerCase()}` : undefined}
        />
      )}
    </div>
  );
}
