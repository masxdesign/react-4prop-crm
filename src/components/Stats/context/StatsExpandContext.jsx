import React, { createContext, useContext, useState } from 'react';

const StatsExpandContext = createContext(null);

/**
 * Custom hook to access stats expand/collapse state
 * @returns {Object} Context value with expand state and toggle functions
 */
export const useStatsExpand = () => {
  const context = useContext(StatsExpandContext);
  if (!context) {
    throw new Error('useStatsExpand must be used within StatsExpandProvider');
  }
  return context;
};

/**
 * Provider component for managing hierarchical expand/collapse state
 *
 * State structure:
 * - expandedEntities: Map of entity IDs to { properties: [], isLoading: boolean }
 * - expandedProperties: Set of property IDs that are expanded to show enquirers
 */
export const StatsExpandProvider = ({ children }) => {
  // Track expanded agencies/advertisers with their properties and loading state
  // Structure: { [entityId]: { properties: [], isLoading: boolean } }
  const [expandedEntities, setExpandedEntities] = useState({});

  // Track expanded property IDs (for enquirer details)
  // Using Set for efficient toggle operations
  const [expandedProperties, setExpandedProperties] = useState(new Set());

  /**
   * Toggle entity (agency/advertiser) expansion
   * @param {string} entityId - The entity ID to toggle
   * @param {Array} properties - The properties array to store (optional, for setting)
   */
  const toggleEntity = (entityId, properties = null) => {
    setExpandedEntities(prev => {
      const current = prev[entityId];

      // If currently expanded, collapse it
      if (current) {
        const { [entityId]: removed, ...rest } = prev;
        return rest;
      }

      // Otherwise expand it with properties (if provided) or empty state
      return {
        ...prev,
        [entityId]: {
          properties: properties || [],
          isLoading: properties === null
        }
      };
    });
  };

  /**
   * Set loading state for an entity
   * @param {string} entityId - The entity ID
   * @param {boolean} isLoading - Loading state
   */
  const setEntityLoading = (entityId, isLoading) => {
    setExpandedEntities(prev => {
      const current = prev[entityId];
      if (!current) return prev;

      return {
        ...prev,
        [entityId]: {
          ...current,
          isLoading
        }
      };
    });
  };

  /**
   * Set properties for an entity
   * @param {string} entityId - The entity ID
   * @param {Array} properties - The properties array
   */
  const setEntityProperties = (entityId, properties) => {
    setExpandedEntities(prev => ({
      ...prev,
      [entityId]: {
        properties,
        isLoading: false
      }
    }));
  };

  /**
   * Check if an entity is expanded
   * @param {string} entityId - The entity ID
   * @returns {boolean}
   */
  const isEntityExpanded = (entityId) => {
    return !!expandedEntities[entityId];
  };

  /**
   * Get entity data (properties and loading state)
   * @param {string} entityId - The entity ID
   * @returns {Object|null} { properties: [], isLoading: boolean } or null
   */
  const getEntityData = (entityId) => {
    return expandedEntities[entityId] || null;
  };

  /**
   * Toggle property expansion (for enquirer details)
   * @param {string|number} propertyId - The property ID
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
   * @param {string|number} propertyId - The property ID
   * @returns {boolean}
   */
  const isPropertyExpanded = (propertyId) => {
    return expandedProperties.has(propertyId);
  };

  const value = {
    // Entity (agency/advertiser) methods
    toggleEntity,
    setEntityLoading,
    setEntityProperties,
    isEntityExpanded,
    getEntityData,

    // Property methods
    toggleProperty,
    isPropertyExpanded
  };

  return (
    <StatsExpandContext.Provider value={value}>
      {children}
    </StatsExpandContext.Provider>
  );
};
