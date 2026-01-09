// Build revision array from original content + revision history
// Backend includes pending placeholder when remix is in progress
export const buildRevisionArray = (originalContent, revisionHistory) => {
  const revisions = [
    { version: 0, content: originalContent, isOriginal: true, id: null }
  ];

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
          // Pending revision from backend
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
            feedback: rev.user_feedback,
            createdAt: rev.created_at,
            id: rev.id,
            isOriginal: false
          });
        }
      });
  }

  return revisions;
};

// Helper to find index by version number
export const findIndexByVersion = (revisions, version) => {
  if (version == null) return revisions.length - 1;
  const idx = revisions.findIndex(r => r.version === version);
  return idx >= 0 ? idx : revisions.length - 1;
};
