import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import bizchatClient from '@/services/bizchatClient';

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
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Debounced search function
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setAgents([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        // Search for agents by email - you may need to adjust this API endpoint
        const { data } = await bizchatClient.get(`/api/crm/agents/search`, {
          params: { email: searchTerm }
        });
        setAgents(data || []);
      } catch (error) {
        console.error('Error searching agents:', error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAgentSelect = (agent, onChange) => {
    setSelectedAgent(agent);
    setSearchTerm(agent.email);
    setOpen(false);
    onChange(agent.NID); // Return the NID as the field value
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
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      placeholder={placeholder}
                      value={searchTerm}
                      onChange={(e) => handleInputChange(e.target.value, onChange)}
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
                </PopoverTrigger>
                
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandList>
                      {loading && (
                        <CommandEmpty>Searching...</CommandEmpty>
                      )}
                      {!loading && agents.length === 0 && searchTerm.length >= 2 && (
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                      )}
                      {!loading && agents.length > 0 && (
                        <CommandGroup>
                          {agents.map((agent) => (
                            <CommandItem
                              key={agent.NID}
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
                                  {agent.Position && (
                                    <div className="text-xs text-gray-500">
                                      {agent.Position}
                                    </div>
                                  )}
                                </div>
                                {selectedAgent?.NID === agent.NID && (
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