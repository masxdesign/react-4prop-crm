import React from 'react';
import { format } from 'date-fns';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';

const InlineCalendar = ({
  // Form integration
  control,
  name,
  rules = {},
  
  // Content configuration
  label = "Date",
  
  // Date constraints
  minDate,
  maxDate,
  
  // Styling
  className,
  calendarClassName,
  
  ...props
}) => {
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
                  if (minDate) {
                    isDisabled = isDisabled || date < new Date(minDate);
                  }
                  if (maxDate) {
                    isDisabled = isDisabled || date > new Date(maxDate);
                  }
                  return isDisabled;
                }}
                initialFocus
                className="w-full"
                {...props}
              />
            </div>
            
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

export default InlineCalendar;