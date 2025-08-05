import React from 'react';
import ScheduleItem from './ScheduleItem';

const ScheduleCardView = ({ schedules }) => {
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {schedules.map((schedule) => (
        <ScheduleItem key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
};

export default ScheduleCardView;