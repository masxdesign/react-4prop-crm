import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import _ from 'lodash';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import TableHoverCard from '../CRMTable/components/TableHoverCard';

function DialogNavigation ({ info }) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    
    const { dialogModel } = info.table.options.meta
    const { rows } = info.table.getRowModel()
  
    const getInfoByIndex = useCallback((index) => {
      const visibleCells = rows[index]?.getVisibleCells()
      return visibleCells?.[0]?.getContext()
    }, [info.table.options.data])
  
    const getInfoByOffset = useCallback(
      (offset) => getInfoByIndex(info.row.index + offset), 
      [info.row.index, getInfoByIndex]
    )
  
    const nextInfo = useMemo(() => getInfoByOffset(1), [getInfoByOffset])
    const prevInfo = useMemo(() => getInfoByOffset(-1), [getInfoByOffset])
  
    const handleJump = (index) => {
      const info = getInfoByIndex(index)
      dialogModel.showDialog(info.row.original.id)
    }
  
    return (
      <div className='space-x-1'>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
                variant="link"
                className="h-8 w-8 p-0"
                size="sm"
            >
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DialogNavigationDropdownContent open={dropdownOpen} currentIndex={info.row.index} rows={rows} onSelect={handleJump} />
        </DropdownMenu>
        {[
          { id: 'prev', info: prevInfo, icon: ChevronLeftIcon },
          { id: 'next', info: nextInfo, icon: ChevronRightIcon }
        ].map(({ id, info, icon: Icon }) => (
          <HoverCard key={id} openDelay={1000}>
            <HoverCardTrigger asChild>
              <Button
                  variant="link"
                  className="h-8 w-8 p-0"
                  size="sm"
                  onClick={() => dialogModel.showDialog(info.row.original.id)}
                  disabled={!info}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            {info && (
              <HoverCardPortal container={document.body}>
                  <HoverCardContent className="w-[300px]">
                    <TableHoverCard cell={info} hideView />
                  </HoverCardContent>
              </HoverCardPortal>
            )}
          </HoverCard>
        ))}
      </div>
    )
}

function DialogNavigationDropdownContent ({ open, currentIndex, rows, onSelect }) {
    const ref = useRef()
  
    const handleSelect = (e) => {
      onSelect(e.target.dataset.id)
    }
  
    useLayoutEffect(() => {
  
      if(open) {
        setTimeout(() => {
          const previous = currentIndex > 1 ? -1: 0
          ref.current?.querySelector(`.item-${currentIndex + previous}`).scrollIntoView()
        }, 1)
      }
  
    }, [open, currentIndex])
  
    return (
      <DropdownMenuContent ref={ref} align="start" className="overflow-auto h-64">
        {rows.map((row) => (
            <DropdownMenuItem 
              key={row.original.id} 
              data-id={row.original.id}
              disabled={currentIndex === row.index} 
              className={cn("flex flex-col items-start", `item-${row.index}`)}
              onSelect={handleSelect}
            >
              <span className='font-bold'>{row.getValue('fullName')}</span>
              <span className='text-muted-foreground'>{row.getValue('company')}</span>
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    )
}

export default DialogNavigation