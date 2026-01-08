export default function RawJsonTab({ outputData }) {
  return (
    <pre className="p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
      {JSON.stringify(outputData?.output_data, null, 2)}
    </pre>
  );
}
