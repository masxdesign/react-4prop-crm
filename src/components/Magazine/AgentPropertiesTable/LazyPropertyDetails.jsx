import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { propReqContentsQuery } from '@/store/listing.queries'
import EnhancedPropertyDetails from './EnhancedPropertyDetails'

/** Lazy-load property content when row is expanded */
const LazyPropertyDetails = ({ property, agentId, isAdminViewing, viewingAgentNid }) => {
  const pid = property?.pid

  // Fetch content only when this component mounts (i.e., when row expands)
  const { data: contentsData, isLoading: contentLoading } = useQuery({
    ...propReqContentsQuery([pid]),
    enabled: !!pid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Merge content into property
  const enhancedProperty = useMemo(() => {
    if (!property) return null

    const contentArray = contentsData?.[pid] || []
    const [description = '', locationdesc = '', amenities = ''] = contentArray

    return {
      ...property,
      content: {
        ...property.content,
        description: description || property.content?.description || '',
        location: locationdesc || property.content?.location || '',
        amenities: amenities || property.content?.amenities || '',
      },
    }
  }, [property, contentsData, pid])

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading property details...</span>
      </div>
    )
  }

  if (!enhancedProperty) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Property not found
      </div>
    )
  }

  return (
    <EnhancedPropertyDetails
      property={enhancedProperty}
      agentId={agentId}
      isAdminViewing={isAdminViewing}
      viewingAgentNid={viewingAgentNid}
    />
  )
}

export default LazyPropertyDetails
