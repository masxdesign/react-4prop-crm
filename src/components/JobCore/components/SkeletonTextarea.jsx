export default function SkeletonTextarea({ minRows = 3 }) {
  const height = minRows * 24 + 16; // Approximate height based on rows
  return (
    <div
      className="w-full rounded-md border border-gray-200 bg-gray-50 animate-pulse"
      style={{ height: `${height}px` }}
    >
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        {minRows > 3 && <div className="h-3 bg-gray-200 rounded w-2/3" />}
      </div>
    </div>
  );
}
