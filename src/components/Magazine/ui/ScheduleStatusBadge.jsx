// React is available globally - no need to import
import { cn } from '@/lib/utils';
import PlatformMorBadge from './PlatformMorBadge';
import { getScheduleStatusDisplay } from '../util/scheduleStatusHelpers';

const ScheduleStatusBadge = ({ schedule, className, ...props }) => {
  const status = getScheduleStatusDisplay(schedule);

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
          status.color,
          className
        )}
        {...props}
      >
        <span className="text-xs">{status.icon}</span>
        {status.label}
      </span>
      {/* Show Platform MoR badge for active subscriptions */}
      {schedule.subscription_schedule_id && schedule.platform_mor && (
        <PlatformMorBadge schedule={schedule} />
      )}
    </div>
  );
};

export default ScheduleStatusBadge;