export default function EmptyState({ message = 'No output data available' }) {
  return <p className="text-gray-400 text-sm">{message}</p>;
}
