import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { Building, Briefcase, Check } from 'lucide-react';
import { useAgentSearch } from '@/hooks/useAgentSearch';

// Helper function to get agent initials
const getAgentInitials = (firstname, surname) => {
  const firstInitial = firstname?.charAt(0)?.toUpperCase() || '';
  const lastInitial = surname?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
};

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
  const [failedImages, setFailedImages] = useState(new Set());

  const { agents, isSearching, hasResults, debouncedSearchTerm } = useAgentSearch(searchTerm);

  const handleImageError = (agentNid) => {
    setFailedImages(prev => new Set(prev).add(agentNid));
  };

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
                      {isSearching && (
                        <CommandEmpty>Searching...</CommandEmpty>
                      )}
                      {!isSearching && !hasResults && debouncedSearchTerm.length >= 2 && (
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                      )}
                      {!isSearching && hasResults && (
                        <CommandGroup>
                          {agents.map((agent) => (
                            <CommandItem
                              key={agent.nid}
                              value={agent.email}
                              onSelect={() => handleAgentSelect(agent, onChange)}
                              className={cn(
                                "flex items-start gap-3 p-3 cursor-pointer transition-colors",
                                "hover:bg-gray-50 data-[selected=true]:bg-blue-50",
                                selectedAgent?.nid === agent.nid && "bg-blue-50 border-l-2 border-blue-500"
                              )}
                            >
                              {/* Avatar */}
                              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
                                {agent.picture && !failedImages.has(agent.nid) ? (
                                  <img
                                    src={agent.picture}
                                    alt={`${agent.firstname} ${agent.surname}`}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImageError(agent.nid)}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                    {getAgentInitials(agent.firstname, agent.surname)}
                                  </div>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {/* Name and Email */}
                                <div className="space-y-1">
                                  <div className="font-semibold text-gray-900 text-base leading-tight">
                                    {agent.firstname} {agent.surname}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">
                                    {agent.email}
                                  </div>
                                </div>
                                
                                {/* Company and Position Tags */}
                                {(agent.company || agent.position) && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {agent.company && (
                                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                        <Building className="w-3 h-3" />
                                        <span className="truncate max-w-[120px]">{agent.company}</span>
                                      </div>
                                    )}
                                    {agent.position && (
                                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                                        <Briefcase className="w-3 h-3" />
                                        <span className="truncate max-w-[120px]">{agent.position}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Selection Indicator */}
                              {selectedAgent?.nid === agent.nid && (
                                <div className="flex-shrink-0 text-blue-600 ml-2">
                                  <Check className="w-5 h-5" />
                                </div>
                              )}
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