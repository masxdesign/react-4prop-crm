// React is available globally - no need to import
import ScheduleStatusBadge from '../ui/ScheduleStatusBadge';

// Schedule Status Component - now uses the new ScheduleStatusBadge
const ScheduleStatus = ({ schedule }) => {
  return <ScheduleStatusBadge schedule={schedule} />;
};

export default ScheduleStatus;