import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/_dashboard/dashboard/data/clients')({
  beforeLoad: () => ({
    nav: [
      { to: 'list', label: 'List' },
      { to: 'add', label: 'Add' },
      { to: 'import', label: 'Import' },
    ]
  })
})