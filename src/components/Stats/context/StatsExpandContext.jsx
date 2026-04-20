import React, { createContext, useContext, useState } from 'react';

const StatsExpandContext = createContext(null);

/**
 * Access stats expand/collapse UI state
 */
export const useStatsExpand = () => {
  const context = useContext(StatsExpandContext);
  if (!context) {
    throw new Error('useStatsExpand must be used within StatsExpandProvider');
  }
  return context;
};

/**
 * Provider for managing expand/collapse UI state
 * Data fetching is handled by TanStack Query in individual components
 */
export const StatsExpandProvider = ({ children }) => {
  // Track expanded entity IDs (agencies/advertisers)
  const [expandedEntities, setExpandedEntities] = useState(new Set());

  // Track expanded property IDs (for enquirer details)
  const [expandedProperties, setExpandedProperties] = useState(new Set());

  /**
   * Toggle entity (agency/advertiser) expansion state
   */
  const toggleEntity = (entityId) => {
    setExpandedEntities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entityId)) {
        newSet.delete(entityId);
      } else {
        newSet.add(entityId);
      }
      return newSet;
    });
  };

  /**
   * Check if an entity is expanded
   */
  const isEntityExpanded = (entityId) => {
    return expandedEntities.has(entityId);
  };

  /**
   * Toggle property expansion (for enquirer details)
   */
  const toggleProperty = (propertyId) => {
    setExpandedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  /**
   * Check if a property is expanded
   */
  const isPropertyExpanded = (propertyId) => {
    return expandedProperties.has(propertyId);
  };

  const value = {
    // Entity (agency/advertiser) UI state
    toggleEntity,
    isEntityExpanded,

    // Property UI state
    toggleProperty,
    isPropertyExpanded
  };

  return (
    <StatsExpandContext.Provider value={value}>
      {children}
    </StatsExpandContext.Provider>
  );
};
