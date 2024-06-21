import { fetchNegotiatorByNids } from '@/api/fourProp';
import { queryOptions } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

const initialExcluded = []

export default function useSelectionControl ({ tableSSModal, tableModel, dataPool, navigate }) {
  const { table } = tableSSModal

  const [open, setOpen] = useState(false)
  
  const [excluded, setExcluded] = useState(initialExcluded)

  const selected = useMemo(() => 
    tableSSModal.selected.filter((id) => !excluded.includes(id)), 
    [tableSSModal.selected, excluded]
  )

  const fetchSelectedDataQueryOptions = useMemo(() =>
      queryOptions({
          queryKey: ['fetchSelectedData', tableSSModal.selected],
          queryFn: async () => {

              const nidsToFetch = tableSSModal.selected.filter(id => !dataPool.has(id))

              if (nidsToFetch.length > 0) {

                  const fetched = await fetchNegotiatorByNids(nidsToFetch)

                  for(const item of fetched) {
                      dataPool.set(item.id, item)
                  }

              }

              return tableSSModal.selected.map(id => dataPool.get(id))
          }
      }), 
      [tableSSModal.selected, dataPool.size]
  )

  const onExcludedApply = excluded => {
    tableModel.deselectMany(excluded)

    table.getRowModel().rows
        .filter(({ original }) => excluded.includes(original.id))
        .forEach((row) => {
            row.toggleSelected()
        })
  }
  
  const onItemCheckedChange = (value, checked) => {
    if (checked) {
      setExcluded(excluded.filter((item) => item !== value))
    } else {
      setExcluded([ ...excluded, value ])
    }
  }

  const onSelectAll = () => {
    setExcluded(initialExcluded)
  }
  
  const onDeselectAll = () => {
    setExcluded(tableSSModal.selected)
  }

  const onDeselectAllAndApply = () => {
    onExcludedApply(tableSSModal.selected)
    setExcluded([])
    setOpen(false)
  }

  const onOpenChange = (value) => {
    setOpen(value)
    if (!value) {
      onExcludedApply(excluded)
      setExcluded([])
    }
  }

  const onItemView = (item) => {
    navigate({
      search: (prev) => ({
          ...prev,
          open: true,
          info: item.id,
      }),
    })
  }

  return {
    selected,
    open,
    excluded,
    onItemCheckedChange,
    onDeselectAllAndApply,
    onOpenChange,
    onSelectAll,
    onDeselectAll,
    onItemView,
    fetchSelectedDataQueryOptions
  }
}