import { createFileRoute } from '@tanstack/react-router';
import { KeywordAnalyzer } from '@/features/keywords/KeywordAnalyzer';

export const Route = createFileRoute('/_auth/_dashboard/keywords')({
  component: KeywordAnalyzer
});
