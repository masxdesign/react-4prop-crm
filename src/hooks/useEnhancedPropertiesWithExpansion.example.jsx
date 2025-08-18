import React, { useState } from 'react';
import { useEnhancedPropertiesWithExpansion } from './propertyDetails-hooks';

/**
 * Example component demonstrating useEnhancedPropertiesWithExpansion hook
 * This shows how to use the hook with raw properties and expansion state
 */
const EnhancedPropertiesExample = () => {
  // Mock raw properties data (would come from your main query)
  const rawProperties = [
    {
      pid: 123,
      types: '1,2',
      pstids: '5,6',
      street: 'Main Street',
      streetnumber: '123',
      towncity: 'London',
      tenure: 4,
      price: 500000,
      // ... other property fields
    },
    {
      pid: 456,
      types: '2,3',
      pstids: '7,8',
      street: 'Oak Avenue',
      streetnumber: '456',
      towncity: 'Manchester',
      tenure: 1,
      rent: 2000,
      // ... other property fields
    }
  ];

  // State to track which properties are expanded
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Toggle expansion for a property
  const toggleRowExpansion = (pid) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(pid)) {
      newExpanded.delete(pid);
    } else {
      newExpanded.add(pid);
    }
    setExpandedRows(newExpanded);
  };

  // Use the enhanced properties hook
  const {
    data: enhancedProperties,
    isLoading,
    error,
    isContentLoading,
    hasContentData,
    contentErrors,
    allPids,
    expandedPidsArray
  } = useEnhancedPropertiesWithExpansion(rawProperties, expandedRows);

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Enhanced Properties Example</h2>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>Total Properties: {enhancedProperties.length}</p>
        <p>Expanded Properties: {expandedPidsArray.length}</p>
        <p>Content Loading: {isContentLoading ? 'Yes' : 'No'}</p>
        <p>Has Content Data: {hasContentData ? 'Yes' : 'No'}</p>
        {contentErrors.length > 0 && (
          <p className="text-red-500">Content Errors: {contentErrors.length}</p>
        )}
      </div>

      <div className="space-y-4">
        {enhancedProperties.map((property) => (
          <div 
            key={property.pid} 
            className="border rounded-lg p-4 bg-white shadow"
          >
            {/* Property Header */}
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleRowExpansion(property.pid)}
            >
              <div>
                <h3 className="font-semibold">{property.title}</h3>
                <p className="text-gray-600">{property.addressText}</p>
                <p className="text-sm text-blue-600">{property.tenureText}</p>
              </div>
              <button className="text-blue-500 font-medium">
                {expandedRows.has(property.pid) ? '▼ Collapse' : '▶ Expand'}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedRows.has(property.pid) && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Property Details</h4>
                    <p><strong>Types:</strong> {property.typesText}</p>
                    <p><strong>Subtypes:</strong> {property.subtypesText}</p>
                    <p><strong>Size:</strong> {property.sizeText || 'N/A'}</p>
                    <p><strong>Status:</strong> {property.statusText}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Content</h4>
                    {isContentLoading && expandedRows.has(property.pid) ? (
                      <p className="text-gray-500">Loading content...</p>
                    ) : (
                      <>
                        <p><strong>Description:</strong> {property.content.description || 'No description'}</p>
                        <p><strong>Location:</strong> {property.content.location || 'No location info'}</p>
                        <p><strong>Amenities:</strong> {property.content.amenities || 'No amenities listed'}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Images */}
                {property.pictures.count > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Images ({property.pictures.count})</h4>
                    <div className="flex gap-2 overflow-x-auto">
                      {property.pictures.thumbs.slice(0, 5).map((thumb, index) => (
                        <img 
                          key={index}
                          src={thumb} 
                          alt={`Property ${property.pid} - ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            Loading properties...
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPropertiesExample;