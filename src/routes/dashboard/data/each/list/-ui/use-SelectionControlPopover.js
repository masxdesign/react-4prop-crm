import { useState } from 'react';
import { map } from 'lodash';

const initialExcluded = []

export default function useSelectionControlPopover ({ selection, onExcludedApply }) {
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

  const onOpenChange = (value) => {
    setOpen(value)
    if (!value) {
      onExcludedApply(excluded)
      setExcluded([])
    }
  }

  return {
    selected,
    selection,
    open,
    excluded,
    onItemCheckedChange,
    onOpenChange,
    onSelectAll,
    onDeselectAll
  }
}