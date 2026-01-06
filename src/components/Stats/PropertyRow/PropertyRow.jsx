import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStatsExpand } from '../context/StatsExpandContext';
import propertyParse from '@/utils/propertyParse';
import usePropertyTypeLabels from '@/hooks/usePropertyTypeLabels';
import displaySize from '@/utils/displaySize';
import displayTenure from '@/utils/displayTenure';

/**
 * Avatar with fallback to initials
 */
const Avatar = ({ src, alt, fallbackText }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="relative inline-block">
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className="h-8 w-8 rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-medium text-white">
          {fallbackText}
        </div>
      )}
    </div>
  );
};

/**
 * Property card with metrics and expandable enquirer list
 */
const PropertyRow = ({ property }) => {
  const { isPropertyExpanded, toggleProperty } = useStatsExpand();
  const isExpanded = isPropertyExpanded(property.pid);
  const [showAllSubtypes, setShowAllSubtypes] = React.useState(false);

  // Get type/subtype labels
  const { getSubtypeLabels, isLoading: labelsLoading } = usePropertyTypeLabels();

  // Format property address using propertyParse utility
  const address = useMemo(() => {
    return propertyParse.addressText({
      showMore: true,
      showBuilding: true,
      showPostcode: true
    })(property);
  }, [property]);

  // Convert pstids to readable labels
  const subtypeLabels = useMemo(() => {
    if (!property.pstids || labelsLoading) return [];
    return getSubtypeLabels(property.pstids);
  }, [property.pstids, getSubtypeLabels, labelsLoading]);

  // Parse property size using propertyParse utility
  const sizeData = useMemo(() => {
    return propertyParse.size(property);
  }, [property]);

  // Parse property tenure using propertyParse utility
  const tenureData = useMemo(() => {
    return propertyParse.tenure(property);
  }, [property]);

  // Format size text for display
  const sizeText = useMemo(() => {
    if (!sizeData.isIn) return null;
    return displaySize({ ...sizeData, decimal: 2 });
  }, [sizeData]);

  // Format tenure text for display
  const tenureText = useMemo(() => {
    return displayTenure(tenureData);
  }, [tenureData]);

  // Get initials from name
  const getInitials = (first, last) => {
    const firstInitial = first ? first.charAt(0).toUpperCase() : '';
    const lastInitial = last ? last.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || '?';
  };

  const hasEnquirers = property.enquirers && property.enquirers.length > 0;

  return (
    <div className="border-l-4 border-l-primary/20 bg-white rounded-lg border shadow-sm p-4 mb-3">
      {/* Property Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="mb-1">
            <h4 className="font-medium text-gray-900">{address}</h4>
          </div>

          {/* Subtype badges */}
          {subtypeLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {(showAllSubtypes ? subtypeLabels : subtypeLabels.slice(0, 3)).map((label, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
              {subtypeLabels.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllSubtypes(!showAllSubtypes);
                  }}
                >
                  {showAllSubtypes ? 'Show less' : `+${subtypeLabels.length - 3} more`}
                </Badge>
              )}
            </div>
          )}

          {/* Tenure and Size */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {tenureText && <span>{tenureText}</span>}
            {tenureText && sizeText && <span>•</span>}
            {sizeText && <span>{sizeText}</span>}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-5 gap-4 mb-4 pb-4 border-b">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">
            {property.phone_reveals?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Phone Reveals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">
            {property.pdf_requests?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">View PDF</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">
            {property.viewing_requests?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Viewing Requests</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">
            {property.search_clicks?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Search Clicks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">
            {property.enquiry_submissions?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Enquiries</div>
        </div>
      </div>

      {/* Enquirers Section */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleProperty(property.pid)}
          className="w-full justify-between hover:bg-muted/50"
        >
          <span className="text-sm font-medium">
            {hasEnquirers
              ? `${property.enquirers.length} Enquirer${property.enquirers.length !== 1 ? 's' : ''}`
              : 'No Enquirers'}
          </span>
          {hasEnquirers && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          )}
        </Button>

        {/* Enquirers List (Level 4) */}
        {isExpanded && hasEnquirers && (
          <div className="mt-3 space-y-2">
            {property.enquirers.map((enquirer) => (
              <div
                key={enquirer.user_id}
                className="flex items-center gap-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Avatar
                  src={enquirer.avatar}
                  alt={`${enquirer.first} ${enquirer.last}`}
                  fallbackText={getInitials(enquirer.first, enquirer.last)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {enquirer.first} {enquirer.last}
                  </div>
                  <div className="text-xs text-gray-600">
                    {enquirer.occurred_at
                      ? format(parseISO(enquirer.occurred_at), 'MMM dd, yyyy HH:mm')
                      : 'Date not available'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No enquirers message when expanded */}
        {isExpanded && !hasEnquirers && (
          <div className="mt-3 text-center py-4 text-sm text-gray-500">
            No enquiries yet for this property
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyRow;
