import { useMemo, useState } from 'react';

const initialExcluded = []

export default function useSelectionControl ({ tableSSModal, tableModel, makeFetchNegQueryOptions, navigate }) {
  const { table } = tableSSModal

  const [open, setOpen] = useState(false)
  
  const [excluded, setExcluded] = useState(initialExcluded)

  const selected = useMemo(() => 
    tableSSModal.selected.filter((id) => !excluded.includes(id)), 
    [tableSSModal.selected, excluded]
  )

  const fetchSelectedDataQueryOptions = useMemo(
    () => makeFetchNegQueryOptions(tableSSModal.selected), 
    [tableSSModal.selected]
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