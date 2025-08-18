import React from 'react';
import { format, parseISO } from 'date-fns';
import ScheduleStatus from './ScheduleStatus';
import ScheduleActionButtons from '../ui/ScheduleActionButtons';

const ScheduleItem = ({ schedule }) => {
  // Calculate display values based on available data
  let duration, rate;
  
  if (schedule.week_no && schedule.fixed_week_rate) {
    // Week-based data
    duration = `${schedule.week_no} week${schedule.week_no !== 1 ? 's' : ''}`;
    rate = `£${schedule.fixed_week_rate}/week`;
  } else {
    duration = 'N/A';
    rate = 'N/A';
  }
  
  return (
    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium text-gray-900">{schedule.advertiser_company}</div>
          <div className="text-xs text-gray-500">Advertiser ID: {schedule.advertiser_id}</div>
        </div>
        <ScheduleStatus schedule={schedule} />
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Period:</span>
          <div className="font-medium">
            {schedule.start_date && schedule.end_date && 
             typeof schedule.start_date === 'string' && typeof schedule.end_date === 'string'
              ? `${format(parseISO(schedule.start_date), 'MMM dd, yyyy')} - ${format(parseISO(schedule.end_date), 'MMM dd, yyyy')}`
              : 'N/A'
            }
          </div>
        </div>
        <div>
          <span className="text-gray-500">Duration:</span>
          <div className="font-medium">{duration}</div>
        </div>
        <div>
          <span className="text-gray-500">Rate:</span>
          <div className="font-medium">{rate}</div>
        </div>
        <div>
          <span className="text-gray-500">Quote:</span>
          <div className="font-semibold text-green-600">£{schedule.quote.toFixed(2)}</div>
        </div>
      </div>
      
      {schedule.notes && (
        <div className="mt-2 text-sm">
          <span className="text-gray-500">Notes:</span>
          <div className="text-gray-700">{schedule.notes}</div>
        </div>
      )}
      
      <ScheduleActionButtons 
        schedule={schedule} 
        propertyId={schedule.property_id}
        className="mt-3"
      />
    </div>
  );
};

export default ScheduleItem;