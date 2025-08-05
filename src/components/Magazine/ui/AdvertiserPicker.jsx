import React from 'react';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';

const AdvertiserPicker = ({
  // Form integration
  name,
  control,
  rules,
  
  // Data
  advertisers = [],
  
  // Content configuration
  label = "Advertiser",
  placeholder = "Select an advertiser...",
  
  // Styling control
  containerHeight = "200px",
  cardClassName = "",
  selectedCardClassName = "",
  containerClassName = "",
  
  className,
  ...props
}) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label} *</label>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value, onChange }, fieldState: { error } }) => {
          const selectedAdvertiserId = parseInt(value) || null;
          
          const handleCardClick = (advertiserId) => {
            onChange(advertiserId);
          };
          
          return (
            <div className="space-y-2">
              {/* Scrollable Cards Container */}
              <div 
                className={cn(
                  "border border-gray-300 rounded-md overflow-y-auto",
                  containerClassName
                )}
                style={{ height: containerHeight }}
              >
                {advertisers.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    {placeholder}
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {advertisers.map((advertiser) => {
                      const isSelected = selectedAdvertiserId === advertiser.id;
                      
                      return (
                        <div
                          key={advertiser.id}
                          onClick={() => handleCardClick(advertiser.id)}
                          className={cn(
                            "p-3 border rounded-md cursor-pointer transition-all duration-200",
                            "hover:border-blue-300 hover:bg-blue-50",
                            isSelected 
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
                              : "border-gray-200 bg-white hover:shadow-sm",
                            cardClassName,
                            isSelected && selectedCardClassName
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {advertiser.company}
                              </div>
                              <div className="text-sm text-gray-600">
                                £{advertiser.week_rate}/week
                              </div>
                            </div>
                            {isSelected && (
                              <div className="text-blue-500 ml-2">
                                <svg 
                                  className="w-5 h-5" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
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

export default AdvertiserPicker;