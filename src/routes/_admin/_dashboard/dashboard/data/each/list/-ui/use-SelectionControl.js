import { useState } from 'react';

const initialExcluded = []

export default function useSelectionControl ({ tableSelectionModel, navigate }) {
  const { selectedIds, selection, onExcludedApply } = tableSelectionModel
  const [open, setOpen] = useState(false)
  
  const [excluded, setExcluded] = useState(initialExcluded)

  const selected = selectedIds.filter((id) => !excluded.includes(id))
  
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
    setExcluded(selectedIds)
  }

  const onDeselectAllAndApply = () => {
    onExcludedApply(selectedIds)
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
    const { id, _pageIndex } = item
    navigate({
      search: (prev) => ({
          ...prev,
          page: _pageIndex + 1,
          open: true,
          info: id,
      }),
    })
  }

  return {
    selected,
    selection,
    open,
    excluded,
    onItemCheckedChange,
    onDeselectAllAndApply,
    onOpenChange,
    onSelectAll,
    onDeselectAll,
    onItemView
  }
}