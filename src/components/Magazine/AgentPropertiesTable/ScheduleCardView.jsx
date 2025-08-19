import React from 'react';
import ScheduleItem from './ScheduleItem';

const ScheduleCardView = ({ schedules }) => {
  return (
    <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
      {schedules.map((schedule) => (
        <ScheduleItem key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
};

export default ScheduleCardView;