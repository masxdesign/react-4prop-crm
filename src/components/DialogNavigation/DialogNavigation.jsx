import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import _ from 'lodash';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import TableHoverCard from '../CRMTable/components/TableHoverCard';
import { Table2Icon } from 'lucide-react';

function DialogNavigation ({ fromTableInfo, ...props }) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    
    const { dialogModel } = fromTableInfo.table.options.meta
    const { rows } = fromTableInfo.table.getRowModel()
  
    const getInfoByIndex = useCallback((index) => {
      const visibleCells = rows[index]?.getVisibleCells()
      return visibleCells?.[0]?.getContext()
    }, [fromTableInfo.table.options.data])
  
    const getInfoByOffset = useCallback(
      (offset) => getInfoByIndex(fromTableInfo.row.index + offset), 
      [fromTableInfo.row.index, getInfoByIndex]
    )
  
    const nextInfo = useMemo(() => getInfoByOffset(1), [getInfoByOffset])
    const prevInfo = useMemo(() => getInfoByOffset(-1), [getInfoByOffset])
  
    const handleJump = (index) => {
        const info = getInfoByIndex(index)
        dialogModel.showDialog(info.row.original.id)
    }
  
    return (
      <div className='flex flex-col-reverse gap-3 items-center flex-nowrap' {...props}>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="link"
                    className="size-8 p-0 text-emerald-300"
                    size="sm"
                >
                  <Table2Icon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DialogNavigationDropdownContent 
              open={dropdownOpen} 
              currentIndex={fromTableInfo.row.index} 
              rows={rows} 
              onSelect={handleJump} 
            />
        </DropdownMenu>
        {[
          { id: 'prev', info: prevInfo, icon: ChevronLeftIcon },
          { id: 'next', info: nextInfo, icon: ChevronRightIcon }
        ].map(({ id, info, icon: Icon }) => (
          <HoverCard key={id} openDelay={1000}>
            <HoverCardTrigger asChild>
              <Button
                  variant="link"
                  className="bg-emerald-500 hover:bg-emerald-400 rounded-full size-6 p-0"
                  size="sm"
                  onClick={() => dialogModel.showDialog(info.row.original.id)}
                  disabled={!info}
                  tabIndex={-1}
              >
                <Icon className="size-4 text-emerald-950" />
              </Button>
            </HoverCardTrigger>
            {info && (
              <HoverCardPortal container={document.body}>
                  <HoverCardContent  
                    className="w-auto p-0 border-none bg-transparent"
                    side="left"
                    align="center"
                    sideOffset={5}
                  >
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
        const { dataset } = e.target
        onSelect(dataset.index, dataset.id)
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
        {rows.map((row) => {
          let companyText = row.getValue('company')

          if (_.isEmpty(companyText)) companyText = <i className='opacity-50'>No company</i>

          return (
              <DropdownMenuItem 
                key={row.original.id} 
                data-id={row.original.id}
                data-index={row.index}
                disabled={currentIndex === row.index} 
                className={cn("flex flex-col items-start w-[180px]", `item-${row.index}`)}
                onSelect={handleSelect}
              >
                <span className='font-bold'>{row.getValue('fullName')}</span>
                <span className='text-muted-foreground'>{companyText}</span>
              </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    )
}

export default DialogNavigation