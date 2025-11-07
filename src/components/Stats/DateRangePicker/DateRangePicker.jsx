import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/**
 * DateRangePicker Component
 *
 * A date range selector using shadcn Calendar and Popover components.
 * Displays two months and allows selecting a date range.
 *
 * @param {Object} props
 * @param {Object} props.value - Current date range { from: Date, to: Date }
 * @param {Function} props.onChange - Callback when range is applied, receives { from: string, to: string } in yyyy-MM-dd format
 * @param {string} props.className - Additional CSS classes
 * @param {Date} props.minDate - Minimum selectable date
 * @param {Date} props.maxDate - Maximum selectable date
 * @param {boolean} props.disabled - Whether the picker is disabled
 */
const DateRangePicker = ({
  value = { from: null, to: null },
  onChange,
  className,
  minDate,
  maxDate,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  // Temporary state for selection before applying
  const [tempRange, setTempRange] = useState(value);

  // Format display text for button
  const getDisplayText = () => {
    if (!value.from) {
      return 'Pick a date range';
    }
    if (!value.to) {
      return format(new Date(value.from), 'MMM dd, yyyy');
    }
    return `${format(new Date(value.from), 'MMM dd, yyyy')} - ${format(new Date(value.to), 'MMM dd, yyyy')}`;
  };

  // Handle apply button click
  const handleApply = () => {
    if (tempRange.from && tempRange.to) {
      onChange({
        from: format(tempRange.from, 'yyyy-MM-dd'),
        to: format(tempRange.to, 'yyyy-MM-dd')
      });
      setOpen(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setTempRange(value);
    setOpen(false);
  };

  // When popover opens, reset temp range to current value
  const handleOpenChange = (newOpen) => {
    if (newOpen) {
      setTempRange({
        from: value.from ? new Date(value.from) : null,
        to: value.to ? new Date(value.to) : null
      });
    }
    setOpen(newOpen);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value.from && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              mode="range"
              selected={{
                from: tempRange.from,
                to: tempRange.to
              }}
              onSelect={(range) => {
                setTempRange({
                  from: range?.from || null,
                  to: range?.to || null
                });
              }}
              numberOfMonths={2}
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
            />
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!tempRange.from || !tempRange.to}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
