import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { typesQuery, subtypesQuery } from '@/store/listing.queries';
import { propertyTypescombiner } from '@/store/use-listing';

/**
 * Custom hook for resolving raw property type IDs and subtype IDs to readable labels
 * 
 * This hook is specifically designed for components that work with raw ID data
 * (like advertiser cards with pstids) and need to convert them to display labels.
 * 
 * Note: This is NOT used for property information sections that already have
 * display-ready data (like property.typesText, property.subtypesText).
 * 
 * @returns {Object} Hook result with resolver functions and loading states
 */
const usePropertyTypeLabels = () => {
  // Fetch types and subtypes data using existing queries for cache efficiency
  const { 
    data: typesData, 
    isLoading: typesLoading, 
    error: typesError 
  } = useQuery(typesQuery);
  
  const { 
    data: subtypesData, 
    isLoading: subtypesLoading, 
    error: subtypesError 
  } = useQuery(subtypesQuery);

  // Combine data using existing combiner (same pattern as useEnhancedPropertiesWithExpansion)
  const { typeMap, subtypeMap } = useMemo(() => {
    if (!typesData || !subtypesData) {
      return { typeMap: new Map(), subtypeMap: new Map() };
    }

    const propertyTypes = propertyTypescombiner(typesData, subtypesData);
    const typeMap = new Map();
    const subtypeMap = new Map();

    propertyTypes.forEach(type => {
      if (type && type.id) {
        typeMap.set(String(type.id), type);
        if (type.subtypes && Array.isArray(type.subtypes)) {
          type.subtypes.forEach(subtype => {
            if (subtype && subtype.id) {
              subtypeMap.set(String(subtype.id), subtype);
            }
          });
        }
      }
    });

    return { typeMap, subtypeMap };
  }, [typesData, subtypesData]);

  // Individual label resolvers
  const getTypeLabel = useCallback((typeId) => {
    if (!typeId || !typeMap.size) return '';
    const type = typeMap.get(String(typeId).trim());
    return type?.label || type?.name || 'Unknown Type';
  }, [typeMap]);

  const getSubtypeLabel = useCallback((subtypeId) => {
    if (!subtypeId || !subtypeMap.size) return '';
    const subtype = subtypeMap.get(String(subtypeId).trim());
    return subtype?.label || subtype?.name || 'Unknown Subtype';
  }, [subtypeMap]);

  // Array label resolvers for comma-separated ID strings
  const getTypeLabels = useCallback((typeIds) => {
    if (!typeIds || !typeMap.size) return [];
    
    const ids = typeIds.replace(/^,|,$/g, '').split(',').filter(id => id.trim());
    return ids.map(id => getTypeLabel(id.trim())).filter(Boolean);
  }, [typeMap, getTypeLabel]);

  const getSubtypeLabels = useCallback((subtypeIds) => {
    if (!subtypeIds || !subtypeMap.size) return [];
    
    const ids = subtypeIds.replace(/^,|,$/g, '').split(',').filter(id => id.trim());
    return ids.map(id => getSubtypeLabel(id.trim())).filter(Boolean);
  }, [subtypeMap, getSubtypeLabel]);

  return {
    // Loading states
    isLoading: typesLoading || subtypesLoading,
    error: typesError || subtypesError,
    
    // Main resolver functions for comma-separated ID strings
    getTypeLabels,
    getSubtypeLabels,
    
    // Individual resolvers for single IDs
    getTypeLabel,
    getSubtypeLabel,
    
    // Raw maps for advanced usage
    typeMap,
    subtypeMap,
    
    // Helper flags
    hasData: typeMap.size > 0 && subtypeMap.size > 0
  };
};

export default usePropertyTypeLabels;