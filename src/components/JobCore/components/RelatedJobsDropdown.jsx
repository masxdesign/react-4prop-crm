import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatRelativeTime, formatCostUSD } from '../utils';

export default function RelatedJobsDropdown({ jobs, currentJobId, onJobChange }) {
  if (!jobs || jobs.length <= 1) return null;

  return (
    <div className="mb-4">
      <Select value={currentJobId} onValueChange={onJobChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              <span className="flex items-center gap-2">
                <span>{formatRelativeTime(job.completed_at || job.created_at)}</span>
                {job.cost_usd != null && (
                  <span className="text-emerald-600">{formatCostUSD(job.cost_usd)}</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
