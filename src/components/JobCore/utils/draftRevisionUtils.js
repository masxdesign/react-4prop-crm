/**
 * Build revision array from draft revision history
 * In the draft system, there's no "original" - all content exists as revisions
 * Version 1 = first revision (the original from job creation)
 */
export const buildDraftRevisionArray = (revisionHistory) => {
  const revisions = [];

  if (revisionHistory?.revisions) {
    revisionHistory.revisions
      .sort((a, b) => {
        // Keep pending at the end
        if (a.version === 'pending') return 1;
        if (b.version === 'pending') return -1;
        return a.version - b.version;
      })
      .forEach(rev => {
        if (rev.is_pending) {
          revisions.push({
            version: 'pending',
            content: '',
            isPending: true,
            id: null
          });
        } else {
          revisions.push({
            version: rev.version,
            content: rev.new_content,
            source: rev.source,
            sourceJobId: rev.source_job_id,
            createdAt: rev.created_at,
            createdBy: rev.created_by,
            id: rev.id,
            isOriginal: rev.version === 1 // First revision is the "original"
          });
        }
      });
  }

  return revisions;
};

/**
 * Find index by version number in draft revisions
 * Uses selected_version from backend response
 */
export const findDraftIndexByVersion = (revisions, selectedVersion) => {
  if (selectedVersion == null || revisions.length === 0) {
    return Math.max(0, revisions.length - 1);
  }
  const idx = revisions.findIndex(r => r.version === selectedVersion);
  return idx >= 0 ? idx : Math.max(0, revisions.length - 1);
};

/**
 * Get content for a field based on selected version
 * Falls back to draft content if no revision history
 */
export const getDraftSelectedContent = (draftContent, revisionHistory) => {
  if (!revisionHistory?.revisions?.length) {
    return draftContent || '';
  }

  const revisions = buildDraftRevisionArray(revisionHistory);
  const selectedVersion = revisionHistory?.selected_version;
  const currentIndex = findDraftIndexByVersion(revisions, selectedVersion);
  const current = revisions[currentIndex];

  if (current?.isPending) {
    // During pending, show the previous content
    const prevIndex = Math.max(0, currentIndex - 1);
    return revisions[prevIndex]?.content || draftContent || '';
  }

  return current?.content || draftContent || '';
};
