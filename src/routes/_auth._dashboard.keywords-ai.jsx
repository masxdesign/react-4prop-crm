import { createFileRoute } from '@tanstack/react-router';
import { KeywordAnalyzerAI } from '@/features/keywords/KeywordAnalyzerAI';

export const Route = createFileRoute('/_auth/_dashboard/keywords-ai')({
  component: KeywordAnalyzerAI
});
