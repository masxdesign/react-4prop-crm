import { Clock, Loader2, CheckCircle, XCircle, Ban } from 'lucide-react';

export const JOB_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  running: {
    label: 'Running',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Loader2,
    spin: true,
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Ban,
  },
};
