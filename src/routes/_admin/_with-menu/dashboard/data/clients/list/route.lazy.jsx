import { useMemo } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'
import useTableState from '@/hooks/use-TableModel';
import useSheetState from '@/hooks/use-sheetState';
import DataTableSS from '@/components/DataTableSS';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import ClientFormEdit from '../-ui/ClientFormEdit';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoriesPrimitive from '@/routes/dashboard/-ui/CategoriesPrimitive';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Mail, MapPin, Phone } from 'lucide-react';
import LogChatboxContainer from '@/routes/_admin/_with-menu/dashboard/data/clients/list/-ui/LogChatboxContainer';


export const Route = createLazyFileRoute('/_admin/_with-menu/dashboard/data/clients/list')({
    component: ClientsListComponent
})

function ClientsListComponent() {

  const { tableName, queryOptions, columns } = Route.useRouteContext()
  
  const tableProps = useTableState({ queryOptions })

  const [infoSheet, sheet, showSheet, resetSheet, tabsSheet] = useSheetState()
  const [infoDialog, dialog, showDialog] = useSheetState()

  const meta = useMemo(() => ({ 
    dataQueryKey: queryOptions.queryKey,
    showSheet,
    showDialog
  }), [queryOptions.queryKey])

  return (
    <>
      <div className='overflow-hidden p-4'>
        <DataTableSS 
          tableName={tableName}
          columns={columns}
          meta={meta}
          {...tableProps}
        />
        {infoSheet && (
          <Sheet {...sheet}>
              <SheetContent side="right" className="w-[375px] sm:w-[800px]">
                  <div className="space-y-6">
                      <SheetHeader>
                        <SheetTitle>{infoSheet.row.getValue('fullName')}</SheetTitle>
                        <SheetDescription>{infoSheet.row.getValue('company')}</SheetDescription>
                      </SheetHeader>
                      <Separator />
                      <ClientFormEdit 
                        info={infoSheet}
                        onSubmit={resetSheet}
                        {...tabsSheet}
                      />
                  </div>
              </SheetContent>
          </Sheet>
        )}
        {infoDialog && (
          <Dialog {...dialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <Collapsible> 
                  <DialogTitle>
                    {infoDialog.row.getValue('fullName')}
                  </DialogTitle>
                  <DialogDescription>
                    <CollapsibleTrigger className='flex space-x-2 items-center'> 
                      <CategoriesPrimitive info={infoDialog} />
                      <span>{infoDialog.row.getValue('company')}</span>
                      <CaretSortIcon className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild className='flex flex-wrap'>
                      <span>
                        {[
                          { field: 'email', icon: <Mail className="h-3 w-3" /> },
                          { field: 'phone', icon: <Phone className="h-3 w-3" /> },
                          { 
                            field: 'address', 
                            render: (info) => `${info.row.getValue('city')} ${info.row.getValue('postcode')}`, 
                            icon: <MapPin className="h-3 w-3" /> 
                          }
                        ].map(({ field, render, icon }) => (
                          <span key={field} className='flex space-x-1 mr-4 items-center'>
                            {icon}
                            <span className='text-nowrap'>
                              {render ? render(infoDialog) : infoDialog.row.getValue(field)}
                            </span>
                          </span>
                        ))}
                      </span>
                    </CollapsibleContent>
                  </DialogDescription>
                </Collapsible>
              </DialogHeader>
              <LogChatboxContainer info={infoDialog} />        
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  )
}