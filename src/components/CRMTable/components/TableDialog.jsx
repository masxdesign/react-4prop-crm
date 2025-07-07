import React, { Suspense, useEffect, useRef } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { cx } from 'class-variance-authority';
import _, { isEmpty } from 'lodash';
import useTableModel from '@/hooks/use-TableModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Chatbox from './Chatbox';
import CSSOnMount from './CSSOnMount';
import DialogNavigation from '@/components/DialogNavigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Trash2Icon } from 'lucide-react';
import { propertyEnquiriesQuery } from '@/services/fourProp';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { EnquiryMessagingWidgetInView } from '@/routes/_auth._com/-ui/EnquiriesPage';
import { useAuth } from '@/components/Auth/Auth';

function TableDialog({ model, ...props }) {
    return (
        <Dialog
            open={model.dialogModel.state.open}
            onOpenChange={model.dialogModel.onOpenChange}
            {...props}
        >
            <DialogContent className="transition-all sm:max-w-[900px] min-h-[600px] p-0 overflow-hidden">
                {model.id ? (
                    <TableDialogContentRenderer model={model} />
                ) : (
                    <p>Loading...</p>
                )}
            </DialogContent>
        </Dialog>
    )
}

function TableDialogContentRenderer ({ model }) {
    const resultFromTable = useTableModel.use.getResultFromTable(model)

    return resultFromTable ? (
        <TableDialogContent
            info={resultFromTable.row.original}
            fromTable={resultFromTable}
            model={model}
        />
    ) : (
        <Suspense
            fallback={
                <p className="inset-0 absolute flex items-center justify-center text-lg opacity-40 font-bold">
                    Loading...
                </p>
            }
        >
            <TableDialogContentFetcher model={model} />
        </Suspense>
    )
}

function TableDialogContentFetcher ({ model }) {
    const { data } = useSuspenseQuery(model.infoQueryOptions)

    return <TableDialogContent info={data} model={model} />
}

const panelDefaultSize = {
    info: 40,
    other: 50
}

const ResizeableLeftSide = ({ info, model, fromTable }) => {
    const { metricsComponent: MetricsComponent } = model
    return (
        <>
            <DialogHeader className="pt-4 px-4">
                <DialogTitle className="flex gap-4 items-center capitalize">
                    <span className='mr-auto'>{`${info.first} ${info.last}`}</span>
                    {fromTable && (
                        <DialogNavigation info={fromTable} />
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="link"
                                className="h-8 w-8 p-0"
                                size="sm"
                            >
                                <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem className="group cursor-pointer focus:hover:bg-red-100">
                                <Trash2Icon className="h-4 w-4 mr-2 group-hover:text-red-500" /> 
                                <span className='text-muted-foreground group-hover:text-red-500'>
                                    Move to bin
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </DialogTitle>
            </DialogHeader>
            <MetricsComponent 
                info={info} 
                model={model} 
                className="flex-grow" 
            />
        </>
    )
}

const TwoColumnResizeable = ({ autoSaveId, info, model, fromTable, rightsideContent }) => {
    const refA = useRef()
    const leftDefaultSize = panelDefaultSize[autoSaveId]

    useEffect(() => {

        refA.current.resize(leftDefaultSize)
        
    }, [autoSaveId])

    const handleLayoutChange = (sizes) => {
        console.log(sizes);
    }

    return (
        <CSSOnMount
            render={(isMount) => (
                <ResizablePanelGroup
                    autoSaveId={autoSaveId}
                    direction="horizontal"
                    className={cx(
                        "transition-opacity ease-in duration-700",
                        isMount ? "opacity-100" : "opacity-0"
                    )}
                    onLayout={handleLayoutChange}
                >
                    <ResizablePanel
                        ref={refA}
                        defaultSize={leftDefaultSize}
                        minSize={40}
                        maxSize={60}
                        className="flex flex-col gap-4"
                    >
                        <ResizeableLeftSide 
                            info={info}
                            model={model}
                            fromTable={fromTable}
                        />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel  
                        className='bg-slate-100'
                    >
                        {rightsideContent}
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        />
    )
}

const EnquiriesSharedRightSide = ({ model, info }) => {
    const stats = useSuspenseQuery(model.enquiriesQueryOptions(info.owneruid, {
        suitables: model.openEnquiry.suitables,
        shared: model.openEnquiry.shared
    }))
    
    const { data } = useSuspenseQuery(propertyEnquiriesQuery(stats.data))

    const row = data.find((item) => item.id === model.openEnquiry.pid)

    if (!row) return null

    return (
        <div className='p-4 flex flex-col justify-between gap-4 h-full'>
            <div className='flex-shrink max-w-[360px] bg-white mx-auto overflow-hidden rounded-sm shadow-md'>
                <div className='relative'>
                    <Carousel className="overflow-hidden">
                        <CarouselContent>
                            {row.pictures.full.map((source, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative h-[280px] overflow-hidden">
                                        <img src={source} className="object-contain w-full h-full z-10 relative" />
                                        <img src={source} className="object-cover w-full h-full scale-[2] absolute left-0 top-0 z-0 blur-3xl" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                    <div className='flex flex-col absolute bottom-0 left-0 w-full px-4 pb-4 pt-12 bg-gradient-to-t from-black to-transparent'>
                        <span className='font-bold text-sm text-white'>
                            {row.firstSubtype} for {row.tenure.text}
                        </span>
                        <span className='text-xs text-white'>
                            {row.addressText}
                        </span>
                    </div>
                </div>
                <div className='flex flex-row gap-1 p-4'>
                    <Button size="xs" variant="secondary">
                        <a href={`/crm/view-details/${row.id}?i=${info.u_hash}&a=${info.bz_id.substring(1)}`} target="__blank">
                            More info
                        </a>
                    </Button>
                </div>
            </div>
            <EnquiryMessagingWidgetInView 
                bz_hash={info.hash_bz}
                property={row}
                ownerNid={info.ownernid}
                chat_id={row.chat_id} 
                recipientLabel="client"
            />
        </div>
    )
}

function TableDialogContent({ info, model, fromTable = null }) {
    const {
        authUserId,
        chatboxQueryOptions,
        renderMessages,
        addMutationOptions,
        deleteMutationOptions,
        enableBizchat,
        tabValue
    } = model

    return tabValue === "info" ? (
        <TwoColumnResizeable 
            autoSaveId="info"
            info={info}
            model={model}
            fromTable={fromTable}
            rightsideContent={
                authUserId === info.id ? (
                    <div className="h-full">
                        <div className="uppercase opacity-50 font-bold text-sm text-slate-400 w-full h-full flex justify-center items-center">
                            You
                        </div>
                    </div>
                ) : (
                    <Chatbox
                        info={info}
                        chatboxQueryOptions={chatboxQueryOptions}
                        addMutationOptions={addMutationOptions}
                        deleteMutationOptions={deleteMutationOptions}
                        renderMessages={renderMessages}
                        enableDelete={false}
                        enableBizchat={enableBizchat}
                    />
                )
            }
        />
    ) : (
        <TwoColumnResizeable 
            autoSaveId="other"
            info={info}
            model={model}
            fromTable={fromTable}
            rightsideContent={
                model.openEnquiry && (
                    <EnquiriesSharedRightSide model={model} info={info} />
                )
            }
        />
    )
}

export default TableDialog