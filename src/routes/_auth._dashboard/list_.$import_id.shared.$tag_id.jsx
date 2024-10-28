import { createFileRoute } from '@tanstack/react-router'
import { ListSharedComponent } from './list_.$import_id.shared.index'

export const Route = createFileRoute('/_auth/_dashboard/list/$import_id/shared/$tag_id')({
  component: ListSharedComponent
})
