import { useMemo } from 'react';
import { useSuspenseQueries, useQuery, keepPreviousData } from '@tanstack/react-query';
import { chain, compact, isEmpty } from 'lodash';
import { typesQuery, subtypesQuery, propReqContentsQuery } from '@/store/listing.queries';
import { propertyTypescombiner, PROPERTY_STATUS_NAMES, PROPERTY_STATUS_COLORS } from '@/store/use-listing';
import companyCombiner from '@/services/companyCombiner';
import lowerKeyObject from '@/utils/lowerKeyObject';
import displaySize from '@/utils/displaySize';
import displayTenure from '@/utils/displayTenure';
import myDateTimeFormat from '@/utils/myDateTimeFormat';
import { escapetext, fallVals, strip_tags } from '@/utils/misc';
import htmlEntities from '@/utils/htmlEntities';
import Size from '@/utils/Size';
import displayMinMax from '@/utils/displayMinMax';
import number_format from '@/utils/number-format';
import doDecimalSafeMath from '@/utils/doDecimalSafeMath';

/**
 * Enhanced property parsing utilities with improved error handling and validation
 */
export const enhancedPropertyParse = {
  /**
   * Parse property address with enhanced validation and options
   * @param {Object} property - Property data object
   * @param {Object} options - Address parsing options
   * @param {boolean} options.showMore - Show detailed address components
   * @param {boolean} options.showBuilding - Show building information
   * @param {boolean} options.showPostcode - Show postcode
   * @returns {string} Formatted address string
   */
  parseAddress(property, options = {}) {
    const { 
      showMore = true, 
      showBuilding = true, 
      showPostcode = true 
    } = options;

    if (!property || typeof property !== 'object') {
      return 'Address unavailable';
    }

    const { 
      hideidentity = 0,
      centreestate = '',
      buildingnumber = '',
      building = '',
      streetnumber = '',
      street = '',
      towncity = '',
      suburblocality = '',
      matchpostcode = ''
    } = property;

    const hasStreet = !isEmpty(street) && (hideidentity & 2) === 0;
    let title = '';

    try {
      // Building information
      if (showMore && showBuilding) {
        const hasBuildingNumber = !isEmpty(buildingnumber) && (hideidentity & 128) === 0;
        const hasBuilding = !isEmpty(building) && (hideidentity & 64) === 0;

        if (hasBuildingNumber) {
          title += buildingnumber + (hasBuilding ? ' ' : ', ');
        }

        if (hasBuilding) {
          title += `${building}, `;
        }
      }

      // Estate
      if ((hideidentity & 32) < 1 && !isEmpty(centreestate)) {
        title += `${centreestate}, `;
      }

      // Street number
      if (showMore && (hideidentity & 4) < 1 && !isEmpty(streetnumber)) {
        title += streetnumber + (hasStreet ? ' ' : ', ');
      }

      // Street
      if (hasStreet) {
        title += `${street}, `;
      }

      // Suburb/locality
      if (!isEmpty(suburblocality)) {
        title += `${suburblocality}, `;
      }

      // Town/city
      if (!isEmpty(towncity)) {
        title += `${towncity}, `;
      }

      // Postcode
      if (showPostcode && !isEmpty(matchpostcode)) {
        title += matchpostcode;
      }

      // Clean up trailing commas and spaces
      title = title.trim().replace(/,$/, '');

      return escapetext(title) || 'Address unavailable';
    } catch (error) {
      console.warn('Error parsing address:', error);
      return 'Address unavailable';
    }
  },

  /**
   * Parse property types and subtypes with validation
   * @param {Object} property - Property data object
   * @param {Array} propertyTypes - Available property types
   * @returns {Object} Parsed types and subtypes
   */
  parseTypes(property, propertyTypes) {
    if (!property || !propertyTypes || !Array.isArray(propertyTypes)) {
      return { types: [], subtypes: [] };
    }

    const { types = '', pstids = '' } = property;

    try {
      // Create a mapping helper similar to the original but more robust
      const typeMap = new Map();
      const subtypeMap = new Map();

      propertyTypes.forEach(type => {
        if (type && type.id) {
          typeMap.set(String(type.id), type);
          if (type.subtypes && Array.isArray(type.subtypes)) {
            type.subtypes.forEach(subtype => {
              if (subtype && subtype.id) {
                subtypeMap.set(String(subtype.id), { ...subtype, parentType: type });
              }
            });
          }
        }
      });

      // Parse type IDs
      const typeIds = types.split(',').filter(id => id.trim() && typeMap.has(id.trim()));
      const subtypeIds = pstids.split(',').filter(id => id.trim() && subtypeMap.has(id.trim()));

      // Get matched types and subtypes
      const matchedTypes = typeIds.map(id => typeMap.get(id)).filter(Boolean);
      const matchedSubtypes = subtypeIds.map(id => subtypeMap.get(id)).filter(Boolean);

      return {
        types: matchedTypes,
        subtypes: matchedSubtypes
      };
    } catch (error) {
      console.warn('Error parsing property types:', error);
      return { types: [], subtypes: [] };
    }
  },

  /**
   * Parse property size information with validation
   * @param {Object} property - Property data object
   * @returns {Object} Parsed size information
   */
  parseSize(property) {
    if (!property || typeof property !== 'object') {
      return { isIn: false, isExt: false, land: null };
    }

    try {
      const { 
        sizeunit, sizemin, sizemax, 
        sizeunitexternal, minexternal, maxexternal 
      } = property;

      const size = new Size(sizemin, sizemax, sizeunit);
      const sizeExt = new Size(minexternal, maxexternal, sizeunitexternal);

      return {
        isExt: sizeExt.isDefined,
        land: sizeExt.isDefined ? sizeExt.size : null,
        isIn: size.isDefined,
        ...size.size
      };
    } catch (error) {
      console.warn('Error parsing property size:', error);
      return { isIn: false, isExt: false, land: null };
    }
  },

  /**
   * Parse property tenure and pricing information
   * @param {Object} property - Property data object
   * @returns {Object} Parsed tenure information
   */
  parseTenure(property) {
    if (!property || typeof property !== 'object') {
      return { 
        rent: '', rentAlt: '', price: '', priceAlt: '',
        isSale: false, isRent: false, isSaleRent: false,
        value: 0, text: 'Unknown', extended: {}
      };
    }

    try {
      const { 
        tenure = 0, price = 0, rent = 0, rentperiod = '1',
        minintsqft = 0, maxintsqft = 0,
        pricemin = 0, pricemax = 0, rentmin = 0, rentmax = 0
      } = property;

      const period = { "-1": "/sqft", "-2": "/sqm", "1": "pa", "2": "monthly", "4": "weekly" };

      const isRent = (tenure & 3) > 0;
      const isSale = (tenure & 12) > 0;
      const isLease = (tenure & 1) > 0;
      const isShortLease = (tenure & 2) > 0;
      const isFreehold = (tenure & 4) > 0;
      const isLongLeaseHold = (tenure & 8) > 0;

      const shortLabels = ['Lease', 'ShortLs', 'FHold', 'LongLs'];
      const rentCheckIndex = { 0: isLease, 1: isShortLease };
      const saleCheckIndex = { 2: isFreehold, 3: isLongLeaseHold };

      const combiner = (m, n) => Object.entries(m).filter(([_, bool]) => bool).map(([i]) => n[i]);

      const priceMinMax = Math.max(pricemin, pricemax) < 1 ? '' : `£${displayMinMax(pricemin, pricemax, 2)}`;
      const rentMinMax = Math.max(rentmin, rentmax) < 1 ? '' : `£${displayMinMax(rentmin, rentmax, 2)} ${period[rentperiod]}`;

      const extended = {
        shortSaleText: `${combiner(saleCheckIndex, shortLabels).join('/')}  ${priceMinMax}`,
        shortRentText: `${combiner(rentCheckIndex, shortLabels).join('/')}  ${rentMinMax}`
      };

      let formattedRent = '';
      let formattedPrice = '';
      let priceAlt = '';
      let rentAlt = '';

      const intsqft = Math.max(minintsqft, maxintsqft);

      // Calculate alternative pricing per sqft
      if (intsqft > 0) {
        if (isRent && rent > 0) {
          rentAlt = "£";
          if (["-1", "-2"].includes(rentperiod)) {
            rentAlt += number_format(("-1" === rentperiod ? 1 : 0.092903) * rent * intsqft) + " pa";
          } else {
            let r = 1;
            if (rentperiod === "4") r = 52;
            if (rentperiod === "2") r = 12;
            const res = Math.ceil(doDecimalSafeMath(doDecimalSafeMath(rent, "*", r), "/", intsqft));
            rentAlt += (res < 1 ? res.toFixed(2) : number_format(res)) + " /sqft";
          }
        }

        if (isSale && price > 0) {
          const res = Math.ceil(doDecimalSafeMath(price, "/", intsqft));
          priceAlt = "£" + (res < 1 ? res.toFixed(2) : number_format(res)) + " /sqft";
        }
      }

      // Format main pricing
      if (isRent) {
        const formattedRentNum = number_format(rent);
        formattedRent = formattedRentNum == 0 ? 
          (isRent ? "£ROA" : "") : 
          `£${formattedRentNum} ${period[rentperiod]}`;
      }

      if (isSale) {
        const formattedPriceNum = number_format(price);
        formattedPrice = formattedPriceNum == 0 ? 
          (isSale ? "£POA" : "") : 
          `£${formattedPriceNum}`;
      }

      const text = isSale === isRent ? "Rent or Sale" : (isSale ? "Sale" : "Rent");

      return {
        rent: formattedRent,
        rentAlt,
        price: formattedPrice,
        priceAlt,
        isSale,
        isRent,
        isSaleRent: isSale && isRent,
        value: tenure,
        text,
        extended
      };
    } catch (error) {
      console.warn('Error parsing tenure:', error);
      return { 
        rent: '', rentAlt: '', price: '', priceAlt: '',
        isSale: false, isRent: false, isSaleRent: false,
        value: 0, text: 'Unknown', extended: {}
      };
    }
  },

  /**
   * Parse property content with enhanced sanitization
   * @param {Object} property - Property data object
   * @param {Array} contentArray - Additional content array [description, location, amenities]
   * @returns {Object} Parsed content object
   */
  parseContent(property, contentArray = []) {
    if (!property || typeof property !== 'object') {
      return { teaser: '', description: '', location: '', amenities: '' };
    }

    try {
      const { description = '', locationdesc = '', amenities = '' } = property;
      const [extraDesc = '', extraLocation = '', extraAmenities = ''] = contentArray;

      const finalDescription = extraDesc || description || '';
      const finalLocation = extraLocation || locationdesc || '';
      const finalAmenities = extraAmenities || amenities || '';

      let teaser = fallVals(finalDescription, finalLocation, finalAmenities);
      teaser = strip_tags(escapetext(teaser || ''));

      return {
        teaser: teaser.substr(0, 60),
        description: htmlEntities(finalDescription),
        location: htmlEntities(finalLocation),
        amenities: htmlEntities(finalAmenities)
      };
    } catch (error) {
      console.warn('Error parsing content:', error);
      return { teaser: '', description: '', location: '', amenities: '' };
    }
  },

  /**
   * Parse property images with URL validation
   * @param {Object} property - Property data object
   * @returns {Object} Parsed pictures object
   */
  parsePictures(property) {
    if (!property || !property.images || typeof property.images !== 'string') {
      return { count: 0, previews: [], thumbs: [], full: [], captions: [] };
    }

    try {
      const { images } = property;
      const output = [];
      const captions = [];

      images.split('*').forEach((image) => {
        if (image !== "") {
          const im = image.split('|');
          if (im.length >= 6) {
            const z = x => im[1].includes('.') ? im[1] : `${x}.${im[1]}`;
            output.push(x => `https://4prop.com/JSON/NIDs/${im[5]}/${im[0] !== '' ? im[0] : im[3]}/${z(x)}`);
            captions.push(im[2] || '');
          }
        }
      });

      const count = output.length;
      const render_image_paths = x => output.map(k => k(x));

      return {
        count,
        previews: render_image_paths(3),
        thumbs: render_image_paths('t'),
        full: render_image_paths(0),
        captions
      };
    } catch (error) {
      console.warn('Error parsing pictures:', error);
      return { count: 0, previews: [], thumbs: [], full: [], captions: [] };
    }
  },

  /**
   * Parse property companies with filtering
   * @param {Object} property - Property data object
   * @param {Array} companiesPool - Available companies
   * @returns {Array} Filtered and enhanced companies
   */
  parseCompanies(property, companiesPool = []) {
    if (!property || !Array.isArray(companiesPool)) {
      return [];
    }

    try {
      const { cids = '' } = property;
      
      return companiesPool
        .filter(company => company && cids.includes(`,${company.cid},`))
        .map(company => companyCombiner(company))
        .filter(Boolean);
    } catch (error) {
      console.warn('Error parsing companies:', error);
      return [];
    }
  }
};

/**
 * Enhanced property combiner with improved error handling and validation
 * @param {string} pid - Property ID
 * @param {Object} originalProperty - Raw property data
 * @param {Array} propertyTypes - Property types collection
 * @param {Array} contentArray - Content array [description, location, amenities]
 * @param {Array} companiesPool - Available companies
 * @param {Object} settings - Display settings
 * @returns {Object} Enhanced property object
 */
export const enhancedPropertyCombiner = (
  pid,
  originalProperty,
  propertyTypes,
  contentArray = [],
  companiesPool = [],
  settings = { addressShowMore: true, addressShowBuilding: true }
) => {
  // Input validation
  if (!pid || !originalProperty || typeof originalProperty !== 'object') {
    console.warn('Invalid property data provided to enhancedPropertyCombiner');
    return null;
  }

  try {
    const { addressShowMore, addressShowBuilding } = settings;

    // Parse all property components using enhanced parsers
    const parsedTypes = enhancedPropertyParse.parseTypes(originalProperty, propertyTypes);
    const parsedTenure = enhancedPropertyParse.parseTenure(originalProperty);
    const parsedAddress = enhancedPropertyParse.parseAddress(originalProperty, {
      showMore: addressShowMore,
      showBuilding: addressShowBuilding,
      showPostcode: true
    });
    const parsedSize = enhancedPropertyParse.parseSize(originalProperty);
    const parsedContent = enhancedPropertyParse.parseContent(originalProperty, contentArray);
    const parsedPictures = enhancedPropertyParse.parsePictures(originalProperty);
    const parsedCompanies = enhancedPropertyParse.parseCompanies(originalProperty, companiesPool);

    // Calculate derived text fields
    const sizeText = parsedSize.isIn ? displaySize({ ...parsedSize, decimal: 2 }) : null;
    const landText = parsedSize.land ? displaySize({ ...parsedSize.land, decimal: 2 }) : null;
    const typesText = compact(parsedTypes.types.map(t => t.label)).join(', ') || '';
    const subtypesText = compact(parsedTypes.subtypes.map(t => t.label)).join(', ') || '';
    const tenureText = displayTenure(parsedTenure);

    // Generate property title
    const title = `${typesText} to ${parsedTenure.text} in ${parsedAddress}`;

    // Extract additional fields from original property
    const {
      grade,
      gradingupdated,
      grade_from_uid,
      chat_id,
      tag_name,
      tag_id,
      enquiry_choices,
      status,
      dealswith = '',
      latitude,
      longitude,
      gradinguid
    } = originalProperty;

    // Parse agents list
    const agents = chain(dealswith)
      .toString()
      .trim(',')
      .split(',')
      .compact()
      .uniq()
      .value();

    // Build enhanced property object
    const enhancedProperty = {
      // Core identifiers
      id: pid,
      key: `${pid}.${gradinguid || ''}`,

      // Basic info
      title,
      grade,
      chat_id,
      tag_name,
      tag_id,
      enquiry_choices,

      // Processed text fields
      typesText,
      subtypesText,
      addressText: parsedAddress,
      tenureText,
      sizeText,
      landText,

      // Parsed objects
      types: parsedTypes.types,
      subtypes: parsedTypes.subtypes,
      firstSubtype: parsedTypes.subtypes[0]?.label || '',
      tenure: parsedTenure,
      size: parsedSize,
      content: parsedContent,
      pictures: parsedPictures,
      companies: parsedCompanies,
      agents,

      // Computed fields
      thumbnail: parsedPictures.thumbs[0] || null,
      statusText: PROPERTY_STATUS_NAMES[status] || 'Unknown',
      statusColor: PROPERTY_STATUS_COLORS[status] || 'gray',
      grade_from_uid,
      grade_updated: gradingupdated ? myDateTimeFormat(gradingupdated) : null,

      // Geographic data
      lat: latitude ? parseFloat(latitude) : null,
      lng: longitude ? parseFloat(longitude) : null,

      // Reference to original data
      original: originalProperty
    };

    return enhancedProperty;
  } catch (error) {
    console.error('Error in enhancedPropertyCombiner:', error);
    return null;
  }
};

/**
 * Supporting utility functions for property processing
 */
export const propertyUtils = {
  /**
   * Validate property data structure
   * @param {Object} property - Property data to validate
   * @returns {boolean} Whether property data is valid
   */
  validatePropertyData(property) {
    if (!property || typeof property !== 'object') {
      return false;
    }

    // Check for required fields
    const requiredFields = ['pid'];
    return requiredFields.every(field => property[field] !== undefined);
  },

  /**
   * Extract unique PIDs from property array
   * @param {Array} properties - Array of property objects
   * @returns {Array} Array of unique PIDs
   */
  extractPids(properties) {
    if (!Array.isArray(properties)) {
      return [];
    }

    return properties
      .map(prop => prop?.pid)
      .filter(Boolean)
      .filter((pid, index, arr) => arr.indexOf(pid) === index);
  },

  /**
   * Create default property structure for error cases
   * @param {string} pid - Property ID
   * @returns {Object} Default property object
   */
  createPropertyDefaults(pid) {
    return {
      id: pid,
      title: 'Property information unavailable',
      addressText: 'Address unavailable',
      typesText: '',
      subtypesText: '',
      tenureText: '',
      sizeText: null,
      landText: null,
      statusText: 'Unknown',
      statusColor: 'gray',
      pictures: { count: 0, thumbs: [], previews: [], full: [], captions: [] },
      types: [],
      subtypes: [],
      companies: [],
      agents: [],
      content: { teaser: '', description: '', location: '', amenities: '' },
      original: { pid }
    };
  },

  /**
   * Normalize property data by converting keys to lowercase
   * @param {Object} property - Property data object
   * @returns {Object} Normalized property object
   */
  normalizePropertyData(property) {
    try {
      return lowerKeyObject(property);
    } catch (error) {
      console.warn('Error normalizing property data:', error);
      return property;
    }
  }
};

/**
 * Main hook for transforming raw property data into display-ready property objects
 * @param {Array} rawPropertiesArray - Array of raw property data objects
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @param {Object} options.settings - Display settings for property parsing
 * @returns {Object} Hook result with data, loading states, and utilities
 */
export const usePropertyDetails = (rawPropertiesArray = [], options = {}) => {
  const { 
    enabled = true, 
    settings = { addressShowMore: true, addressShowBuilding: true } 
  } = options;

  // Extract PIDs from raw properties and memoize for stable dependencies
  const { normalizedProperties, pids } = useMemo(() => {
    if (!Array.isArray(rawPropertiesArray) || rawPropertiesArray.length === 0) {
      return { normalizedProperties: [], pids: [] };
    }

    // Normalize and validate properties
    const normalized = rawPropertiesArray
      .map(prop => {
        if (!propertyUtils.validatePropertyData(prop)) {
          console.warn('Invalid property data:', prop);
          return null;
        }
        return propertyUtils.normalizePropertyData(prop);
      })
      .filter(Boolean);

    const extractedPids = propertyUtils.extractPids(normalized);

    return {
      normalizedProperties: normalized,
      pids: extractedPids
    };
  }, [rawPropertiesArray]);

  // Define queries for parallel data fetching
  const queries = useMemo(() => {
    const baseQueries = [
      typesQuery,
      subtypesQuery
    ];

    // Only add content query if we have PIDs
    if (pids.length > 0) {
      baseQueries.push(propReqContentsQuery(pids));
    }

    return baseQueries;
  }, [pids]);

  // Fetch all required data in parallel
  const queryResults = useSuspenseQueries({
    queries: queries.map(query => ({
      ...query,
      enabled: enabled && pids.length > 0
    }))
  });

  // Process the query results and transform properties
  const processedData = useMemo(() => {
    // Early return if disabled or no properties
    if (!enabled || normalizedProperties.length === 0) {
      return {
        data: [],
        isLoading: false,
        error: null
      };
    }

    try {
      // Extract data from query results
      const [typesResult, subtypesResult, contentsResult] = queryResults;
      
      // Check for loading states
      const isLoading = queryResults.some(result => result.isLoading);
      
      // Check for errors
      const error = queryResults.find(result => result.error)?.error || null;

      if (isLoading) {
        return { data: [], isLoading: true, error: null };
      }

      if (error) {
        return { data: [], isLoading: false, error };
      }

      // Get the actual data
      const types = typesResult.data;
      const subtypes = subtypesResult.data;
      const contents = contentsResult?.data || {};

      // Combine types and subtypes using existing combiner
      const propertyTypes = propertyTypescombiner(types, subtypes);

      // Transform each property using the enhanced combiner
      const enhancedProperties = normalizedProperties
        .map(property => {
          try {
            const pid = property.pid;
            const contentArray = contents[pid] || [];
            
            return enhancedPropertyCombiner(
              pid,
              property,
              propertyTypes,
              contentArray,
              [], // Companies pool - would need to be fetched separately if needed
              settings
            );
          } catch (error) {
            console.error(`Error processing property ${property.pid}:`, error);
            return propertyUtils.createPropertyDefaults(property.pid);
          }
        })
        .filter(Boolean); // Remove any null results

      return {
        data: enhancedProperties,
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('Error processing property details:', error);
      return {
        data: [],
        isLoading: false,
        error: error
      };
    }
  }, [normalizedProperties, queryResults, enabled, settings]);

  // Provide refetch and invalidate functions
  const refetch = () => {
    queryResults.forEach(result => {
      if (result.refetch) {
        result.refetch();
      }
    });
  };

  const invalidate = () => {
    // This would require queryClient access - could be added as an option
    console.warn('Cache invalidation not implemented yet - use refetch instead');
  };

  return {
    data: processedData.data,
    isLoading: processedData.isLoading,
    error: processedData.error,
    refetch,
    invalidate,
    // Additional utilities
    pids,
    hasData: processedData.data.length > 0,
    count: processedData.data.length
  };
};

/**
 * Hook for processing a single property (convenience wrapper)
 * @param {Object} rawProperty - Single raw property object
 * @param {Object} options - Hook options
 * @returns {Object} Hook result for single property
 */
export const usePropertyDetail = (rawProperty, options = {}) => {
  const propertiesArray = useMemo(() => {
    return rawProperty ? [rawProperty] : [];
  }, [rawProperty]);

  const result = usePropertyDetails(propertiesArray, options);

  return {
    ...result,
    data: result.data[0] || null,
    hasData: !!result.data[0]
  };
};

/**
 * Enhanced hook for paginated agent properties with property details transformation
 * This hook enhances the standard useQuery for agent properties by transforming
 * the paginated data into display-ready property objects.
 * 
 * @param {string} agentId - Agent ID to fetch properties for
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {Object} options - Additional hook options
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @param {Object} options.settings - Display settings for property parsing
 * @param {Function} options.queryFn - Custom query function (should return paginated data)
 * @returns {Object} Enhanced query result with transformed property data
 */
export const useAgentPropertiesPaginated = (
  agentId, 
  page = 1, 
  pageSize = 10, 
  options = {}
) => {
  const { 
    enabled = true,
    settings = { addressShowMore: true, addressShowBuilding: true },
    queryFn = null
  } = options;

  // Import the API function dynamically to avoid circular dependencies
  const defaultQueryFn = useMemo(() => {
    if (queryFn) return queryFn;
    
    // This will be the default query function that matches the existing pattern
    return async () => {
      // Dynamic import to avoid dependency issues
      const { fetchAgentPaginatedProperties } = await import('@/components/Magazine/api');
      return fetchAgentPaginatedProperties(agentId, { page, pageSize });
    };
  }, [agentId, page, pageSize, queryFn]);

  // Main paginated query
  const paginatedQuery = useQuery({
    queryKey: ['agent-properties-paginated', agentId, page, pageSize],
    queryFn: defaultQueryFn,
    placeholderData: keepPreviousData,
    enabled: enabled && !!agentId
  });

  // Extract raw properties from paginated data for transformation
  const rawProperties = useMemo(() => {
    return paginatedQuery.data?.data || [];
  }, [paginatedQuery.data]);

  // Extract PIDs for content fetching
  const pids = useMemo(() => {
    return propertyUtils.extractPids(rawProperties);
  }, [rawProperties]);

  // Fetch required data for property transformation
  const dependencyQueries = useMemo(() => {
    const queries = [typesQuery, subtypesQuery];
    
    // Only fetch content if we have properties
    if (pids.length > 0) {
      queries.push(propReqContentsQuery(pids));
    }
    
    return queries;
  }, [pids]);

  // Fetch transformation dependencies
  const dependencyResults = useSuspenseQueries({
    queries: dependencyQueries.map(query => ({
      ...query,
      enabled: enabled && pids.length > 0
    }))
  });

  // Transform the raw properties into display-ready objects
  const transformedData = useMemo(() => {
    // Return early if main query is loading or has errors
    if (paginatedQuery.isLoading || paginatedQuery.error || !paginatedQuery.data) {
      return {
        ...paginatedQuery.data,
        data: [],
        enhancedData: []
      };
    }

    // Return early if no properties to transform
    if (rawProperties.length === 0) {
      return {
        ...paginatedQuery.data,
        enhancedData: []
      };
    }

    try {
      // Extract dependency data
      const [typesResult, subtypesResult, contentsResult] = dependencyResults;

      // Check if dependencies are still loading
      const dependenciesLoading = dependencyResults.some(result => result.isLoading);
      if (dependenciesLoading) {
        return {
          ...paginatedQuery.data,
          enhancedData: [],
          isTransforming: true
        };
      }

      // Check for dependency errors
      const dependencyError = dependencyResults.find(result => result.error)?.error;
      if (dependencyError) {
        console.warn('Error loading property transformation dependencies:', dependencyError);
        return {
          ...paginatedQuery.data,
          enhancedData: [],
          transformationError: dependencyError
        };
      }

      // Get transformation data
      const types = typesResult.data;
      const subtypes = subtypesResult.data;
      const contents = contentsResult?.data || {};

      // Combine types and subtypes
      const propertyTypes = propertyTypescombiner(types, subtypes);

      // Transform each property
      const enhancedProperties = rawProperties
        .map(property => {
          try {
            // Normalize property data
            const normalizedProperty = propertyUtils.normalizePropertyData(property);
            
            if (!propertyUtils.validatePropertyData(normalizedProperty)) {
              console.warn('Invalid property data during transformation:', normalizedProperty);
              return propertyUtils.createPropertyDefaults(normalizedProperty.pid || 'unknown');
            }

            const pid = normalizedProperty.pid;
            const contentArray = contents[pid] || [];

            return enhancedPropertyCombiner(
              pid,
              normalizedProperty,
              propertyTypes,
              contentArray,
              [], // Companies pool - could be enhanced in the future
              settings
            );
          } catch (error) {
            console.error(`Error transforming property ${property?.pid}:`, error);
            return propertyUtils.createPropertyDefaults(property?.pid || 'unknown');
          }
        })
        .filter(Boolean);

      return {
        ...paginatedQuery.data,
        enhancedData: enhancedProperties
      };
    } catch (error) {
      console.error('Error in property transformation:', error);
      return {
        ...paginatedQuery.data,
        enhancedData: [],
        transformationError: error
      };
    }
  }, [paginatedQuery.data, paginatedQuery.isLoading, paginatedQuery.error, rawProperties, dependencyResults, settings]);

  // Provide enhanced refetch function
  const refetch = () => {
    return paginatedQuery.refetch();
  };

  // Return enhanced query result
  return {
    // Original paginated query data and states
    data: transformedData,
    isLoading: paginatedQuery.isLoading,
    isFetching: paginatedQuery.isFetching,
    isPlaceholderData: paginatedQuery.isPlaceholderData,
    error: paginatedQuery.error,
    refetch,

    // Enhanced property data
    enhancedProperties: transformedData.enhancedData || [],
    
    // Transformation states
    isTransforming: transformedData.isTransforming || false,
    transformationError: transformedData.transformationError || null,
    
    // Utilities
    hasEnhancedData: (transformedData.enhancedData || []).length > 0,
    enhancedCount: (transformedData.enhancedData || []).length,
    pids,

    // Pagination info (preserved from original)
    page: transformedData.page,
    totalPages: transformedData.totalPages,
    pageSize: transformedData.pageSize,
    total: transformedData.total,
    departmentName: transformedData.departmentName
  };
};