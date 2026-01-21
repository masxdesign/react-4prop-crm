import { DatabaseIcon, ImportIcon, ListIcon, NewspaperIcon, CreditCard, ArrowRightLeft, UserCircle, CalendarCheck, TrendingUp, Building2, Users, CalendarClock } from 'lucide-react'
import { EnvelopeOpenIcon } from '@radix-ui/react-icons'
import FourPropIcon from "@/assets/4prop.svg?react"
import BizchatIcon from "@/assets/bizchat.svg?react"
import { RESTRICTED_NEG_IDS } from './permissions'

export const navigationConfig = {
  mainNav: {
    common: [
      {
        id: 'nav-clients',
        to: '/list',
        icon: ListIcon,
        label: 'Clients',
        excludedRoles: ['advertiser']
      },
      {
        id: 'nav-import',
        to: '/import',
        icon: ImportIcon,
        label: 'Import',
        excludedRoles: ['advertiser']
      },
      {
        id: 'nav-inbox',
        to: '/user/active',
        icon: EnvelopeOpenIcon,
        label: 'My inbox',
        excludedRoles: ['advertiser']
      }
    ],
    restricted: [
      {
        id: 'nav-each',
        to: '/each',
        icon: DatabaseIcon,
        label: 'EACH',
        allowedNegIds: RESTRICTED_NEG_IDS
      }
    ]
  },
  magazine: [
    {
      id: 'mag-agents-list',
      to: "/properties",
      icon: NewspaperIcon,
      label: "Properties",
      excludedRoles: ['advertiser']
    },
    // Admin hub pages - grouped navigation for advertiser/agency management
    {
      id: 'advertiser-hub',
      to: "/advertiser",
      icon: Building2,
      label: "Advertiser",
      allowedNegIds: RESTRICTED_NEG_IDS
    },
    {
      id: 'agency-hub',
      to: "/agency",
      icon: Users,
      label: "Agency",
      allowedNegIds: RESTRICTED_NEG_IDS
    },
    {
      id: 'mag-payment-settings',
      to: "/mag/payment-settings",
      icon: CreditCard,
      label: "Payment Settings",
      excludedRoles: ['advertiser']
    },
    {
      id: 'mag-transfers',
      to: "/mag/transfers",
      icon: ArrowRightLeft,
      label: "Transfers",
      allowedNegIds: RESTRICTED_NEG_IDS
    },
    {
      id: 'advertiser-profile',
      to: "/advertiser-profile",
      icon: UserCircle,
      label: "My Profile",
      requiredRoles: ['advertiser']
    },
    // Direct access for non-admin users (advertisers/agents)
    {
      id: 'mag-bookings',
      to: "/booking-history",
      icon: CalendarCheck,
      label: "Booking History",
      excludedRoles: ['admin']
    },
    {
      id: 'stats',
      to: "/stats",
      icon: TrendingUp,
      label: "Statistics",
      excludedRoles: ['admin']
    },
  ],
  admin: [
    {
      id: 'admin-property-scheduler',
      to: '/admin/property-scheduler',
      icon: CalendarClock,
      label: 'Property Scheduler',
      allowedNegIds: RESTRICTED_NEG_IDS,
    },
  ],
  portals: [
    {
      id: 'portal-4prop',
      to: "https://4prop.com",
      icon: FourPropIcon,
      label: "4Prop"
    },
    {
      id: 'portal-bizchat-alert',
      to: (context) => `https://4prop.com/each-alert/${context.hash}/p`,
      icon: BizchatIcon,
      label: "EACH Alert",
      allowedNegIds: RESTRICTED_NEG_IDS
    },
    {
      id: 'portal-bizchat',
      to: "https://4prop.com/bizchat/rooms",
      icon: BizchatIcon,
      label: "Bizchat"
    }
  ]
}