import { cn } from '@/lib/utils';

const BookingStatusBadge = ({ status }) => {
  const styles = {
    active: {
      className: 'bg-green-100 text-green-800 border-green-200',
      label: 'Active'
    },
    upcoming: {
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Upcoming'
    },
    past: {
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Past'
    }
  };

  const config = styles[status?.toLowerCase()] || {
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    label: status || 'Unknown'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
        config.className
      )}
    >
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;
