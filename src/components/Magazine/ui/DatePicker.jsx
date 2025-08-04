import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Controller } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DatePicker = ({
  control,
  name,
  rules = {},
  placeholder = 'Pick a date',
  disabled = false,
  className,
  minDate,
  maxDate,
  portalled,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
        <div className={cn('grid gap-2', className)}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                  error && 'border-red-500 focus-visible:ring-red-500'
                )}
                disabled={disabled}
                onBlur={onBlur}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" portalled={portalled}>
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Format as yyyy-MM-dd for consistency with form expectations
                    onChange(format(date, 'yyyy-MM-dd'));
                    setOpen(false);
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
                {...props}
              />
            </PopoverContent>
          </Popover>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  );
};

export default DatePicker;