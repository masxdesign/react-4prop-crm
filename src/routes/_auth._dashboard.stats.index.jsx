import { createFileRoute } from '@tanstack/react-router';
import StatsRouter from '@/components/Stats/StatsRouter/StatsRouter';

export const Route = createFileRoute('/_auth/_dashboard/stats/')({
  component: StatsRouter,
});
