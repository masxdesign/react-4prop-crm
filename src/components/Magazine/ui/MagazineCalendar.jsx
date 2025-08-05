import React from 'react';
import { format, addWeeks, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { fetchPropertySchedules } from '../api';

const MagazineCalendar = ({
  // Form integration
  control,
  name,
  rules = {},
  
  // Content configuration
  label = "Date",
  
  // Date constraints
  minDate,
  maxDate,
  
  // Magazine-specific props
  propertyId,
  advertiserId,
  
  // Styling
  className,
  calendarClassName,
  
  ...props
}) => {
  // Fetch property schedules using the same pattern as CurrentSchedules.jsx
  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    error: schedulesError
  } = useQuery({
    queryKey: ['property-schedules', propertyId],
    queryFn: () => fetchPropertySchedules(propertyId),
    enabled: !!propertyId,
    refetchOnMount: false,
  });

  // Extract blocked date ranges for the selected advertiser on this property
  const getBlockedDateRanges = () => {
    if (!schedulesData?.data || !advertiserId) return [];
    
    const schedules = schedulesData.data;
    const blockedRanges = [];
    
    // Filter schedules for the selected advertiser
    schedules.forEach(schedule => {
      // Match by advertiser_id (convert to number for comparison)
      if (parseInt(schedule.advertiser_id) === parseInt(advertiserId)) {
        let startDate, endDate;
        
        // Handle week-based schedules (preferred)
        if (schedule.start_date && schedule.week_no) {
          startDate = parseISO(schedule.start_date);
          endDate = addWeeks(startDate, parseInt(schedule.week_no));
        }
        // Handle legacy date-based schedules
        else if (schedule.start_date && schedule.end_date) {
          startDate = parseISO(schedule.start_date);
          endDate = parseISO(schedule.end_date);
        }
        
        if (startDate && endDate) {
          blockedRanges.push({
            start: startOfDay(startDate),
            end: startOfDay(endDate),
            scheduleId: schedule.id,
            startDateFormatted: format(startDate, 'MMM dd, yyyy'),
            endDateFormatted: format(endDate, 'MMM dd, yyyy')
          });
        }
      }
    });
    
    return blockedRanges;
  };

  const blockedRanges = getBlockedDateRanges();

  // Check if a date is blocked by existing schedules for this advertiser
  const isDateBlocked = (date) => {
    const checkDate = startOfDay(date);
    
    return blockedRanges.some(range => {
      return isWithinInterval(checkDate, {
        start: range.start,
        end: range.end
      });
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label} *</label>
      )}
      
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div className="space-y-2">
            {/* Inline Calendar */}
            <div className={cn(
              "border border-gray-300 rounded-md p-0 bg-white inline-block",
              error && "border-red-500",
              calendarClassName
            )}>
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Format as yyyy-MM-dd for consistency with form expectations
                    onChange(format(date, 'yyyy-MM-dd'));
                  }
                }}
                disabled={(date) => {
                  let isDisabled = false;
                  
                  // Apply standard date constraints
                  if (minDate) {
                    isDisabled = isDisabled || date < new Date(minDate);
                  }
                  if (maxDate) {
                    isDisabled = isDisabled || date > new Date(maxDate);
                  }
                  
                  // Apply advertiser-specific blocking for this property
                  if (propertyId && advertiserId && !schedulesLoading && !schedulesError) {
                    isDisabled = isDisabled || isDateBlocked(date);
                  }
                  
                  return isDisabled;
                }}
                modifiers={{
                  blocked: (date) => propertyId && advertiserId && !schedulesLoading && !schedulesError && isDateBlocked(date)
                }}
                modifiersStyles={{
                  blocked: {
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    textDecoration: 'line-through'
                  }
                }}
                initialFocus
                className="w-full"
                {...props}
              />
            </div>
            
            {/* Loading indicator for schedules */}
            {propertyId && schedulesLoading && (
              <p className="text-xs text-gray-500">Loading schedule conflicts...</p>
            )}
            
            {/* Error indicator */}
            {propertyId && schedulesError && (
              <p className="text-xs text-red-500">Error loading schedules</p>
            )}
            
            {/* Schedule conflict warning */}
            {propertyId && advertiserId && !schedulesLoading && !schedulesError && blockedRanges.length > 0 && (
              <div className="text-xs text-orange-600 space-y-1">
                <p>This advertiser has existing schedules on this property:</p>
                {blockedRanges.map((range, index) => (
                  <p key={index} className="text-xs text-orange-500 pl-2">
                    • {range.startDateFormatted} - {range.endDateFormatted}
                  </p>
                ))}
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default MagazineCalendar;