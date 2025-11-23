// Example usage of ScheduleStatusPicker component
import React from 'react';
import { useForm } from 'react-hook-form';
import ScheduleStatusPicker from './ScheduleStatusPicker';

const ExampleForm = () => {
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      scheduleStatus: null,
      requiredStatus: null
    }
  });

  const selectedStatus = watch('scheduleStatus');
  const requiredStatus = watch('requiredStatus');

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    alert(`Selected statuses:\nOptional: ${data.scheduleStatus}\nRequired: ${data.requiredStatus}`);
  };

  const onReset = () => {
    reset({
      scheduleStatus: null,
      requiredStatus: null
    });
  };

  return (
    <div className="space-y-8 p-6 max-w-2xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">ScheduleStatusPicker Examples</h2>
        <p className="text-gray-600">Test the Schedule Status Picker component with different configurations</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Usage (Optional)</h3>
          <ScheduleStatusPicker
            name="scheduleStatus"
            control={control}
            label="Schedule Status"
            placeholder="Select a schedule status..."
            className="max-w-md"
          />
          
          {selectedStatus && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              Selected Status ID: <strong>{selectedStatus}</strong>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Required Field with Validation</h3>
          <ScheduleStatusPicker
            name="requiredStatus"
            control={control}
            rules={{
              required: "Please select a schedule status"
            }}
            label="Required Schedule Status *"
            placeholder="Choose status (required)..."
            className="max-w-md"
          />
          
          {requiredStatus && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              Required Status ID: <strong>{requiredStatus}</strong>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Custom Labels and Messages</h3>
          <ScheduleStatusPicker
            name="customStatus"
            control={control}
            label="Publication Status"
            placeholder="Pick your status..."
            emptyMessage="No statuses found"
            className="max-w-md"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Submit Form
          </button>
          
          <button 
            type="button"
            onClick={onReset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset Form
          </button>
        </div>
      </form>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">Current Form Values</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(watch(), null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ExampleForm;