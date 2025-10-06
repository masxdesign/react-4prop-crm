// React is available globally - no need to import
import { cn } from '@/lib/utils';
import PlatformMorBadge from './PlatformMorBadge';

const ScheduleStatusBadge = ({ schedule, className, ...props }) => {
  // Priority display logic: active > upcoming > expired > workflow status
  // 🔴 🟠 🟡 🟢 🔵 🟣 ⚪️ ⚫️ 🟤 ✅
  const getStatusDisplay = () => {
    if (schedule.cancelled_at) {
      return {
        label: 'Cancelled',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: '🟠'
      };
    }

    if (schedule.active) {
      return {
        label: 'Active',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🟢'
      };
    }
    
    if (schedule.upcoming) {
      return {
        label: 'Scheduled',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '🔵'
      };
    }
    
    if (schedule.completed_at) {
      return {
        label: 'Completed',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅'
      };
    }

    if (schedule.expired) {

      if (schedule.subscription_schedule_id) {
        return {
          label: 'Expired (completed?)',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⚫'
        };
      }

      return {
        label: 'Expired',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '⚫'
      };

    }

    // Fallback to workflow status for non-operational schedules
    switch (schedule.status_id) {
      case 0:
        return {
          label: 'Assign Approver',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '🔴'
        };
      case 1:
        return {
          label: 'Pending Approval',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '🟡'
        };
      case 2:
        return {
          label: 'Awaiting Activation',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '🟣'
        };
      case 3:
        return {
          label: 'Active Subscription',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🟢'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓'
        };
    }
  };

  const status = getStatusDisplay();

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