import { DatabaseIcon, ImportIcon, ListIcon } from 'lucide-react'
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
      },
      {
        id: 'nav-import',
        to: 'import',
        icon: ImportIcon,
        label: 'Import',
      },
      {
        id: 'nav-inbox',
        to: '/crm/user/active',
        icon: EnvelopeOpenIcon,
        label: 'My inbox',
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