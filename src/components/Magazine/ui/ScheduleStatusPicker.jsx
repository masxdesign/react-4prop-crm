import React from 'react';
import { Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchScheduleStatusOptions } from '@/components/Magazine/api';

const ScheduleStatusPicker = ({
  name,
  control,
  rules,
  
  label = "Schedule Status",
  placeholder = "Select a status...",
  emptyMessage = "No status options available",
  
  className,
  ...props
}) => {
  const {
    data: statusOptions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['schedule-status-options'],
    queryFn: fetchScheduleStatusOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value, onChange }, fieldState: { error: fieldError } }) => {
          
          return (
            <div className="space-y-2">
              <Select 
                value={value ? String(value) : ""} 
                onValueChange={(newValue) => onChange(newValue)}
                disabled={isLoading}
              >
                <SelectTrigger className={cn(
                  "w-full",
                  fieldError && "border-red-500 focus-visible:ring-red-500"
                )}>
                  <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {error ? (
                    <div className="p-2 text-red-500 text-sm">
                      Error loading status options
                    </div>
                  ) : statusOptions.length === 0 ? (
                    <div className="p-2 text-gray-500 text-sm">
                      {emptyMessage}
                    </div>
                  ) : (
                    statusOptions.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {fieldError && (
                <p className="text-red-500 text-sm mt-1">{fieldError.message}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default ScheduleStatusPicker;