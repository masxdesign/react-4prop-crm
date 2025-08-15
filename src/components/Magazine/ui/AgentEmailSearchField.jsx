import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { searchAgents } from '../api';

const AgentEmailSearchField = ({
  name,
  control,
  rules,
  
  label = "Agent",
  placeholder = "Type agent email to search...",
  emptyMessage = "No agents found",
  
  className,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents', 'search', debouncedSearchTerm],
    queryFn: () => searchAgents(debouncedSearchTerm),
    enabled: !!debouncedSearchTerm && debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleAgentSelect = (agent, onChange) => {
    setSelectedAgent(agent);
    setSearchTerm(agent.email);
    setOpen(false);
    onChange(agent.nid); // Return the nid as the field value
  };

  const handleInputChange = (value, onChange) => {
    setSearchTerm(value);
    if (!value) {
      setSelectedAgent(null);
      onChange(null);
    }
    if (value.length >= 2) {
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setOpen(true);
    }
  };

  const handleInputClick = () => {
    if (searchTerm.length >= 2) {
      setOpen(true);
    }
  };

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange }, fieldState: { error } }) => {
          return (
            <div className="relative">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                  <div className="relative" data-popover-anchor>
                    <Input
                      placeholder={placeholder}
                      value={searchTerm}
                      onChange={(e) => handleInputChange(e.target.value, onChange)}
                      onFocus={handleInputFocus}
                      onClick={handleInputClick}
                      className={cn(
                        "w-full",
                        error && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {selectedAgent && (
                      <div className="absolute right-2 top-2 text-green-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </PopoverAnchor>
                
                <PopoverContent 
                  className="w-full p-0" 
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onFocusOutside={(e) => {
                    // Prevent closing when clicking on the input or its container
                    if (e.target.closest('[data-popover-anchor]')) {
                      e.preventDefault();
                    }
                  }}
                  onPointerDownOutside={(e) => {
                    // Prevent closing when clicking on the input or its container
                    if (e.target.closest('[data-popover-anchor]')) {
                      e.preventDefault();
                    }
                  }}
                  style={{ width: "var(--radix-popper-anchor-width)" }}
                >
                  <Command>
                    <CommandList>
                      {isLoading && (
                        <CommandEmpty>Searching...</CommandEmpty>
                      )}
                      {!isLoading && agents.length === 0 && searchTerm.length >= 2 && (
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                      )}
                      {!isLoading && agents.length > 0 && (
                        <CommandGroup>
                          {agents.map((agent) => (
                            <CommandItem
                              key={agent.nid}
                              value={agent.email}
                              onSelect={() => handleAgentSelect(agent, onChange)}
                              className="flex flex-col items-start p-3 cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {agent.firstname} {agent.surname}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {agent.email}
                                  </div>
                                  {agent.position && (
                                    <div className="text-xs text-gray-500">
                                      {agent.position}
                                    </div>
                                  )}
                                </div>
                                {selectedAgent?.nid === agent.nid && (
                                  <div className="text-blue-500 ml-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path 
                                        fillRule="evenodd" 
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                        clipRule="evenodd" 
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
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

export default AgentEmailSearchField;