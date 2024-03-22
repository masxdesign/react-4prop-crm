import { useState } from 'react';
import { map } from 'lodash';

const initialExcluded = []

export default function useSelectionControl ({ selection, onExcludedApply }, navigate) {
  const [open, setOpen] = useState(false)
  
  const [excluded, setExcluded] = useState(initialExcluded)

  const selected = selection.filter(({ id }) => !excluded.includes(id))
  
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
    const ids = map(selection, 'id')
    setExcluded(ids)
  }

  const onDeselectAllAndApply = () => {
    const ids = map(selection, 'id')
    onExcludedApply(ids)
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
    const { id, _queryKey: [, , , { pageIndex }] } = item
    navigate({
      search: (prev) => ({
          ...prev,
          page: pageIndex + 1,
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