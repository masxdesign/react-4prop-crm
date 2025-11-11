import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subtypesQuery, typesQuery } from '@/store/listing.queries';
import { propertyTypescombiner } from '@/store/use-listing';

/**
 * Custom hook to get property subtypes list with proper structure
 * Returns both grouped and flat lists of subtypes
 */
const usePropertySubtypes = () => {
  // Fetch types and subtypes data
  const { data: typesData, isLoading: typesLoading } = useQuery(typesQuery);
  const { data: subtypesData, isLoading: subtypesLoading } = useQuery(subtypesQuery);

  // Build grouped subtypes by parent type using propertyTypesCombiner
  const { subtypeOptions, groupedPropertyTypes, subtypeMap } = useMemo(() => {
    if (!typesData || !subtypesData) {
      return {
        subtypeOptions: [],
        groupedPropertyTypes: [],
        subtypeMap: new Map()
      };
    }

    // Use the propertyTypescombiner to get structured property types with subtypes
    const propertyTypes = propertyTypescombiner(typesData, subtypesData);

    // Keep the grouped structure for the select dropdown
    const groupedPropertyTypes = propertyTypes
      .filter(type => type.subtypes && type.subtypes.length > 0)
      .map(type => ({
        id: String(type.id),
        label: String(type.label || ''),
        subtypes: type.subtypes.map(subtype => ({
          id: String(subtype.id),
          label: String(subtype.label || '')
        }))
      }));

    // Create a flat list for lookup purposes
    const flatOptions = [];
    const subtypeMap = new Map();

    groupedPropertyTypes.forEach(type => {
      type.subtypes.forEach(subtype => {
        flatOptions.push({
          id: subtype.id,
          label: subtype.label,
          parentTypeLabel: type.label
        });

        // Add to map for quick lookup
        subtypeMap.set(subtype.id, {
          id: subtype.id,
          label: subtype.label,
          parentTypeLabel: type.label
        });
      });
    });

    return {
      subtypeOptions: flatOptions,
      groupedPropertyTypes,
      subtypeMap
    };
  }, [typesData, subtypesData]);

  /**
   * Get subtype label by ID
   */
  const getSubtypeLabel = (subtypeId) => {
    const subtype = subtypeMap.get(String(subtypeId));
    return subtype?.label || '';
  };

  /**
   * Get multiple subtype labels from comma-delimited ID string
   */
  const getSubtypeLabels = (pstids) => {
    if (!pstids) return [];

    const ids = pstids
      .replace(/^,|,$/g, '')
      .split(',')
      .filter(id => id.trim());

    return ids
      .map(id => getSubtypeLabel(id.trim()))
      .filter(Boolean);
  };

  return {
    // Data structures
    subtypeOptions,
    groupedPropertyTypes,
    subtypeMap,

    // Helper functions
    getSubtypeLabel,
    getSubtypeLabels,

    // Loading state
    isLoading: typesLoading || subtypesLoading
  };
};

export default usePropertySubtypes;
