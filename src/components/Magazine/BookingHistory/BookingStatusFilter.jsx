import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BookingStatusFilter = ({ currentStatus, onStatusChange, currentTotal }) => {
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' }
  ];

  return (
    <Tabs value={currentStatus} onValueChange={onStatusChange} className="max-w-lg">
      <TabsList className="grid w-full grid-cols-4">
        {statuses.map((status) => (
          <TabsTrigger key={status.value} value={status.value} className="flex items-center gap-2">
            {status.label}
            {status.value === currentStatus && currentTotal !== undefined && (
              <span className="ml-1 text-xs opacity-60">
                ({currentTotal})
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default BookingStatusFilter;
