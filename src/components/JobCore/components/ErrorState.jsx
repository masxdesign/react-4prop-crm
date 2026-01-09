export default function ErrorState({ message }) {
  return (
    <div className="p-4 bg-red-50 rounded-lg">
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );
}
