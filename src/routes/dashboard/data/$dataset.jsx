import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '../-components/PendingComponent'

export const Route = createFileRoute('/dashboard/data/$dataset')({
  pendingComponent: PendingComponent,
  beforeLoad: async ({ params }) => {
    let nav = []
    
    switch (params.dataset) {
      case 'clients':
        nav = [
          { to: 'list', label: 'List' },
          { to: 'add', label: 'Add' },
          { to: 'import', label: 'Import' },
        ]
        
        break
      case 'each':
    }

    return {
      nav
    }
    
  }
})