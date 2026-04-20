import { useMemo } from 'react'
import { navigationConfig } from './config'

export function useNavigation(negId, auth) {
  const hasAccess = (item) => {
    // Check if user is excluded by role
    if (item.excludedRoles) {
      if (item.excludedRoles.includes('advertiser') && auth?.isAdvertiser) {
        return false
      }
      if (item.excludedRoles.includes('admin') && auth?.user?.is_admin) {
        return false
      }
    }

    // Check if role is required (e.g., only advertisers can access)
    if (item.requiredRoles && auth?.isAdvertiser) {
      if (!item.requiredRoles.includes('advertiser')) {
        return false
      }
    } else if (item.requiredRoles && !auth?.isAdvertiser) {
      // If requiredRoles is set but user is not advertiser, deny access
      return false
    }

    // Check neg_id based restrictions (admin only)
    if (!item.allowedNegIds) return true
    return item.allowedNegIds.includes(negId)
  }

  const mainNavItems = useMemo(() => {
    const items = [...navigationConfig.mainNav.common]
    const restrictedItems = navigationConfig.mainNav.restricted
      .filter(hasAccess)

    return [...restrictedItems, ...items].filter(hasAccess)
  }, [negId, auth?.isAdvertiser])

  const portalItems = useMemo(() => {
    return navigationConfig.portals.filter(hasAccess)
  }, [negId, auth?.isAdvertiser])

  const magazineItems = useMemo(() => {
    return navigationConfig.magazine.filter(hasAccess)
  }, [negId, auth?.isAdvertiser])

  const adminItems = useMemo(() => {
    return navigationConfig.admin.filter(hasAccess)
  }, [negId, auth?.isAdvertiser])

  return { mainNavItems, portalItems, magazineItems, adminItems }
}