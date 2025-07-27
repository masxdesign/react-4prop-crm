import { useMemo } from 'react'
import { navigationConfig } from './config'

export function useNavigation(negId) {
  const hasAccess = (item) => {
    if (!item.allowedNegIds) return true
    return item.allowedNegIds.includes(negId)
  }

  const mainNavItems = useMemo(() => {
    const items = [...navigationConfig.mainNav.common]
    const restrictedItems = navigationConfig.mainNav.restricted
      .filter(hasAccess)
    
    return [...restrictedItems, ...items]
  }, [negId])

  const portalItems = useMemo(() => {
    return navigationConfig.portals.filter(hasAccess)
  }, [negId])

  return { mainNavItems, portalItems }
}