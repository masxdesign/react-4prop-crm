// Example usage of AgentEmailSearchField component
import React from 'react';
import { useForm } from 'react-hook-form';
import { AgentEmailSearchField } from './index';

const ExampleForm = () => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      agentNID: null
    }
  });

  const selectedAgentNID = watch('agentNID');

  const onSubmit = (data) => {
    console.log('Selected Agent NID:', data.agentNID);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-semibold">Default Size</h3>
        <AgentEmailSearchField
          name="agentNID"
          control={control}
          rules={{
            required: "Please select an agent"
          }}
          label="Select Agent"
          placeholder="Type agent email to search..."
          className="max-w-md"
        />
        
        <h3 className="text-lg font-semibold">Small Size</h3>
        <AgentEmailSearchField
          name="agentNID"
          control={control}
          rules={{
            required: "Please select an agent"
          }}
          label="Select Agent (Small)"
          placeholder="Type agent email to search..."
          size="sm"
          className="max-w-md"
        />
        
        {selectedAgentNID && (
          <div className="text-sm text-gray-600">
            Selected Agent NID: {selectedAgentNID}
          </div>
        )}
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ExampleForm;