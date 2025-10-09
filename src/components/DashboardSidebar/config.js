import { DatabaseIcon, ImportIcon, ListIcon, NewspaperIcon, CreditCard, ArrowRightLeft, UserCircle } from 'lucide-react'
import { EnvelopeOpenIcon } from '@radix-ui/react-icons'
import FourPropIcon from "@/assets/4prop.svg?react"
import BizchatIcon from "@/assets/bizchat.svg?react"
import { RESTRICTED_NEG_IDS } from './permissions'

export const navigationConfig = {
  mainNav: {
    common: [
      {
        id: 'nav-clients',
        to: 'list',
        icon: ListIcon,
        label: 'Clients',
        excludedRoles: ['advertiser']
      },
      {
        id: 'nav-import',
        to: 'import',
        icon: ImportIcon,
        label: 'Import',
        excludedRoles: ['advertiser']
      },
      {
        id: 'nav-inbox',
        to: '/crm/user/active',
        icon: EnvelopeOpenIcon,
        label: 'My inbox',
        excludedRoles: ['advertiser']
      }
    ],
    restricted: [
      {
        id: 'nav-each',
        to: 'each',
        icon: DatabaseIcon,
        label: 'EACH',
        allowedNegIds: RESTRICTED_NEG_IDS
      }
    ]
  },
  magazine: [
    {
      id: 'mag-agents-list',
      to: "/crm/mag",
      icon: NewspaperIcon,
      label: "Properties",
      excludedRoles: ['advertiser']
    },
    {
      id: 'mag-advertisers',
      to: "/crm/mag/manage-advertisers",
      icon: NewspaperIcon,
      label: "Advertisers",
      allowedNegIds: RESTRICTED_NEG_IDS
    },
    // This is for later, admin/advertisers can view current bookings
    // {
    //   id: 'mag-schedules',
    //   to: "/crm/mag/manage-schedule/6",
    //   icon: NewspaperIcon,
    //   label: "Schedules (#6)",
    //   allowedNegIds: RESTRICTED_NEG_IDS
    // },
    {
      id: 'mag-payment-settings',
      to: "/crm/mag/payment-settings",
      icon: CreditCard,
      label: "Payment Settings",
      excludedRoles: ['advertiser']
    },
    {
      id: 'mag-transfers',
      to: "/crm/mag/transfers",
      icon: ArrowRightLeft,
      label: "Transfers",
      allowedNegIds: RESTRICTED_NEG_IDS
    },
    {
      id: 'advertiser-profile',
      to: "/crm/advertiser-profile",
      icon: UserCircle,
      label: "My Profile",
      requiredRoles: ['advertiser']
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