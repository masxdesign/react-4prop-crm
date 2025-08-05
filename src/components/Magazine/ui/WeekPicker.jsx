import React, { useState, useRef, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { pluralizeWeeks } from '../util/pluralize';

// AutoFocusInput component for handling input focus when revealed
const AutoFocusInput = ({ autoFocus = false, ...props }) => {
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  return <Input ref={inputRef} {...props} />;
};

const WeekPicker = ({
  // Form integration
  name,
  control,
  rules,
  
  // Content configuration
  presetWeeks = [1, 2, 3, 4, 6, 8, 12],
  label = "Number of Weeks",
  placeholder = "Enter number of weeks",
  
  // Button styling control
  buttonVariant = "outline",
  selectedButtonVariant = "default",
  buttonSize = "default",
  buttonClassName = "",
  selectedButtonClassName = "",
  
  // Layout control
  buttonsContainerClassName = "flex justify-center flex-wrap gap-2",
  
  // Advanced customization
  renderButton = null,
  buttonProps = {},
  disabledWeeks = [],
  
  // Input styling
  inputClassName = "",
  inputProps = { min: 1, max: 52 },
  
  className,
  ...props
}) => {
  // Internal state for mutual exclusivity
  const [selectedButton, setSelectedButton] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label} *</label>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
          // Initialize state based on current form value
          useEffect(() => {
            // Skip auto-selection if user is actively typing
            if (isTyping) return;
            
            if (value && presetWeeks.includes(parseInt(value))) {
              // Form value matches a preset button
              setSelectedButton(parseInt(value));
              setInputValue('');
              setShowInput(false);
            } else if (value && !presetWeeks.includes(parseInt(value))) {
              // Form value is custom (not in presets)
              setSelectedButton(null);
              setInputValue(value);
              setShowInput(true);
            } else {
              // No form value
              setSelectedButton(null);
              setInputValue('');
              setShowInput(false);
            }
          }, [value, presetWeeks, isTyping]);

          // Clear typing flag after user stops typing
          useEffect(() => {
            if (isTyping) {
              const timer = setTimeout(() => setIsTyping(false), 1000);
              return () => clearTimeout(timer);
            }
          }, [isTyping]);

          const handleButtonClick = (weekCount) => {
            setSelectedButton(weekCount);
            setInputValue('');
            setShowInput(false)
            onChange(weekCount);
          };
          
          const handleInputChange = (e) => {
            const newInputValue = e.target.value;
            setIsTyping(true);
            setSelectedButton(null);
            setInputValue(newInputValue);
            onChange(newInputValue);
          };
          
          const isButtonSelected = (weekCount) => {
            return selectedButton === weekCount;
          };
          
          return (
            <div className="space-y-4">
              {/* Preset Buttons */}
              <div className={cn(buttonsContainerClassName)}>
                {presetWeeks.map((week) => {
                  const isSelected = isButtonSelected(week);
                  const isDisabled = disabledWeeks.includes(week);
                  
                  if (renderButton) {
                    return renderButton({
                      key: week,
                      week,
                      isSelected,
                      disabled: isDisabled,
                      onClick: () => !isDisabled && handleButtonClick(week),
                      ...buttonProps
                    });
                  }
                  
                  return (
                    <Button
                      key={week}
                      type="button"
                      variant={isSelected ? selectedButtonVariant : buttonVariant}
                      size={buttonSize}
                      disabled={isDisabled}
                      onClick={() => handleButtonClick(week)}
                      className={cn(
                        buttonClassName,
                        isSelected && selectedButtonClassName
                      )}
                      {...buttonProps}
                    >
                      {pluralizeWeeks(week)}
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  variant={buttonVariant}
                  size={buttonSize}
                  onClick={() => setShowInput(!showInput)}
                  className={buttonClassName}
                  {...buttonProps}
                >
                  Other
                </Button>
              </div>
              
              {/* Number Input */}
              {showInput && (    
                <AutoFocusInput
                  type="number"
                  autoFocus={showInput}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={onBlur}
                  placeholder={placeholder}
                  className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                    inputClassName
                  )}
                  {...inputProps}
                />
              )}
              
              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default WeekPicker;