import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/data/clients')({
  beforeLoad: () => ({
    nav: [
      { to: 'list', label: 'List' },
      { to: 'add', label: 'Add' },
      { to: 'import', label: 'Import' },
    ]
  })
})