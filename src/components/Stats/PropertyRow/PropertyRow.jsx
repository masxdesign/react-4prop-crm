import React from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStatsExpand } from '../context/StatsExpandContext';

/**
 * Simple Avatar Component
 * Displays user avatar with fallback to initials
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
 * PropertyRow Component
 *
 * Displays property details with metrics and expandable enquirer list.
 * Level 3: Property card with address, agent, metrics
 * Level 4: Enquirer details (expandable)
 *
 * @param {Object} props
 * @param {Object} props.property - Property object with all details and enquirers array
 */
const PropertyRow = ({ property }) => {
  const { isPropertyExpanded, toggleProperty } = useStatsExpand();
  const isExpanded = isPropertyExpanded(property.pid);

  // Format property address
  const formatAddress = () => {
    const parts = [
      property.building,
      property.street,
      property.suburblocality,
      property.towncity,
      property.postcode,
    ].filter(Boolean);

    return parts.join(', ') || 'Address not available';
  };

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
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{formatAddress()}</h4>
            {property.types && (
              <Badge variant="secondary" className="text-xs">
                {property.types}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Agent: {property.agent_name || 'N/A'}
          </p>
          {(property.price || property.rent) && (
            <p className="text-sm text-gray-600">
              {property.price && `£${property.price.toLocaleString()}`}
              {property.rent && `£${property.rent.toLocaleString()}/month`}
            </p>
          )}
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
