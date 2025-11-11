import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
// Removed Command component - has ref bugs with Popover
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { Building, Briefcase, Check, X } from 'lucide-react';
import { useAgentSearch } from '@/hooks/useAgentSearch';
import ImageWithFallback from '@/components/ui/ImageWithFallback';


// CVA variants for different sizes
const inputVariants = cva(
  "w-full",
  {
    variants: {
      size: {
        default: "",
        sm: "h-8 text-xs px-2",
      },
      error: {
        true: "border-red-500 focus-visible:ring-red-500",
      }
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const agentSearchVariants = cva(
  "space-y-2",
  {
    variants: {
      size: {
        default: "",
        sm: "",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const labelVariants = cva(
  "block font-medium mb-1",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const avatarVariants = cva(
  "flex-shrink-0 rounded-full overflow-hidden",
  {
    variants: {
      size: {
        default: "w-8 h-8",
        sm: "w-6 h-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const avatarTextVariants = cva(
  "w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium",
  {
    variants: {
      size: {
        default: "text-xs",
        sm: "text-[10px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const commandItemVariants = cva(
  "flex items-start gap-2 cursor-pointer transition-colors hover:bg-gray-50 data-[selected=true]:bg-blue-50",
  {
    variants: {
      size: {
        default: "p-2",
        sm: "p-1.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const nameVariants = cva(
  "font-semibold text-gray-900 leading-tight",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const emailVariants = cva(
  "text-gray-600 truncate",
  {
    variants: {
      size: {
        default: "text-xs",
        sm: "text-[10px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const tagVariants = cva(
  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
  {
    variants: {
      size: {
        default: "text-[10px]",
        sm: "text-[9px] px-1 py-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const iconVariants = cva(
  "",
  {
    variants: {
      size: {
        default: "w-2.5 h-2.5",
        sm: "w-2 h-2",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const checkIconVariants = cva(
  "",
  {
    variants: {
      size: {
        default: "w-4 h-4",
        sm: "w-3 h-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const AgentEmailSearchField = ({
  name,
  control,
  rules,
  
  label = "Agent",
  placeholder = "Type agent email to search...",
  emptyMessage = "No agents found",
  size = "default",
  onAgentSelect = null,
  selectedAgentEmail = null,
  
  className,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { agents, isSearching, hasResults, debouncedSearchTerm } = useAgentSearch(searchTerm);

  // Initialize search term from selectedAgentEmail prop (for navigation back scenario)
  useEffect(() => {
    if (selectedAgentEmail && !searchTerm && !selectedAgent) {
      setSearchTerm(selectedAgentEmail);
      setSelectedAgent({ email: selectedAgentEmail });
    }
  }, [selectedAgentEmail, searchTerm, selectedAgent]);


  const handleAgentSelect = (agent, onChange) => {
    setSelectedAgent(agent);
    setSearchTerm(''); // Clear the input when agent is selected
    setOpen(false);
    onChange(agent.nid); // Return the nid as the field value

    // Call optional callback with full agent data
    if (onAgentSelect) {
      onAgentSelect(agent);
    }
  };

  const handleInputChange = (value, onChange) => {
    setSearchTerm(value);
    if (!value) {
      setSelectedAgent(null);
      onChange(''); // Use empty string instead of null
    } else if (selectedAgent && value !== selectedAgent.email) {
      setSelectedAgent(null);
      onChange(''); // Use empty string instead of null
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

  const handleClearSelection = (onChange) => {
    setSelectedAgent(null);
    setSearchTerm('');
    onChange('');
  };

  return (
    <div className={cn(agentSearchVariants({ size }), className)} {...props}>
      {label && (
        <label className={cn(labelVariants({ size }))}>{label}</label>
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
                      value={searchTerm || ''}
                      onChange={(e) => handleInputChange(e.target.value, onChange)}
                      onFocus={handleInputFocus}
                      onClick={handleInputClick}
                      className={cn(inputVariants({ size, error }))}
                      disabled={!!selectedAgent}
                    />
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
                  portalled={false}
                >
                  <div className="max-h-[300px] overflow-y-auto">
                    {isSearching && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Searching...
                      </div>
                    )}
                    {!isSearching && !hasResults && debouncedSearchTerm && debouncedSearchTerm.length >= 2 && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                      </div>
                    )}
                    {!isSearching && hasResults && (
                      <div className="p-1">
                          {agents.map((agent) => (
                            <button
                              type="button"
                              key={agent.nid}
                              onClick={() => handleAgentSelect(agent, onChange)}
                              className={cn(
                                commandItemVariants({ size }),
                                "w-full text-left rounded-sm",
                                selectedAgent?.nid === agent.nid && "bg-blue-50 border-l-2 border-blue-500"
                              )}
                            >
                              {/* Avatar */}
                              <div className={cn(avatarVariants({ size }))}>
                                <ImageWithFallback
                                  src={agent.picture}
                                  alt={`${agent.firstname} ${agent.surname}`}
                                  className="w-full h-full object-cover"
                                  fallback={
                                    <div className={cn(avatarTextVariants({ size }))}>
                                      {agent.firstname?.charAt(0)?.toUpperCase() || ''}{agent.surname?.charAt(0)?.toUpperCase() || ''}
                                    </div>
                                  }
                                />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {/* Name and Email */}
                                <div className={cn("space-y-0.5", size === "sm" && "space-y-0")}>
                                  <div className={cn(nameVariants({ size }))}>
                                    {agent.firstname} {agent.surname}
                                  </div>
                                  <div className={cn(emailVariants({ size }))}>
                                    {agent.email}
                                  </div>
                                </div>

                                {/* Company and Position Tags */}
                                {(agent.company || agent.position) && (
                                  <div className={cn("flex flex-wrap gap-1 mt-1", size === "sm" && "gap-0.5 mt-0.5")}>
                                    {agent.company && (
                                      <div className={cn(tagVariants({ size }), "bg-gray-100 text-gray-700")}>
                                        <Building className={cn(iconVariants({ size }))} />
                                        <span className={cn("truncate", size === "default" ? "max-w-[100px]" : "max-w-[80px]")}>{agent.company}</span>
                                      </div>
                                    )}
                                    {agent.position && (
                                      <div className={cn(tagVariants({ size }), "bg-blue-100 text-blue-700")}>
                                        <Briefcase className={cn(iconVariants({ size }))} />
                                        <span className={cn("truncate", size === "default" ? "max-w-[100px]" : "max-w-[80px]")}>{agent.position}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Selection Indicator */}
                              {selectedAgent?.nid === agent.nid && (
                                <div className={cn("flex-shrink-0 text-blue-600", size === "default" ? "ml-1" : "ml-0.5")}>
                                  <Check className={cn(checkIconVariants({ size }))} />
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Selected Agent Banner */}
              {selectedAgent && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  {/* Avatar */}
                  <div className="w-6 h-6 flex-shrink-0 rounded-full overflow-hidden">
                    <ImageWithFallback
                      src={selectedAgent.picture}
                      alt={`${selectedAgent.firstname} ${selectedAgent.surname}`}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-[10px]">
                          {selectedAgent.firstname?.charAt(0)?.toUpperCase() || ''}{selectedAgent.surname?.charAt(0)?.toUpperCase() || ''}
                        </div>
                      }
                    />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-blue-900 leading-tight truncate">
                      {selectedAgent.firstname} {selectedAgent.surname}
                    </div>
                    {selectedAgent.email && (
                      <div className="text-[10px] text-blue-700 truncate">
                        {selectedAgent.email}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleClearSelection(onChange)}
                    className="flex-shrink-0 p-1 hover:bg-blue-100 rounded transition-colors"
                    aria-label="Clear selection"
                  >
                    <X className="w-3 h-3 text-blue-600" />
                  </button>
                </div>
              )}

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