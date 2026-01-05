import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Markdown-style section renderer
function MarkdownSection({ heading, content }) {
  if (!content) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-1">
        {heading}
      </h2>
      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}

// Overview tab showing structured markdown-like content
function OverviewTab({ outputData }) {
  const result = outputData?.output_data?.result || {};

  return (
    <div className="prose prose-sm max-w-none">
      <MarkdownSection heading="Postcode" content={result.postcode} />
      <MarkdownSection heading="Street" content={result.street} />
      <MarkdownSection heading="Demographic" content={result.demographic} />
      <MarkdownSection heading="Description" content={result.description} />
    </div>
  );
}

// Raw JSON tab
function RawJsonTab({ outputData }) {
  return (
    <pre className="p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
      {JSON.stringify(outputData?.output_data, null, 2)}
    </pre>
  );
}

// Loading state
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
}

// Error state
function ErrorState({ message }) {
  return (
    <div className="p-4 bg-red-50 rounded-lg">
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );
}

// Empty state
function EmptyState() {
  return <p className="text-gray-400 text-sm">No output data available</p>;
}

// Displays job output with tabs. Usable in dialogs or standalone pages.
export default function JobOutputContent({
  outputData,
  isLoading = false,
  defaultTab = 'overview'
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (outputData?.error_message) {
    return <ErrorState message={outputData.error_message} />;
  }

  if (!outputData?.output_data) {
    return <EmptyState />;
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="raw">Raw JSON</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <OverviewTab outputData={outputData} />
      </TabsContent>

      <TabsContent value="raw" className="mt-4">
        <RawJsonTab outputData={outputData} />
      </TabsContent>
    </Tabs>
  );
}
