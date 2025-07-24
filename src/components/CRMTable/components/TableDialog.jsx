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
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ExternalLinkIcon, ImageIcon, Loader2, Trash2Icon, User2, X } from 'lucide-react';
import { propertyEnquiriesQuery } from '@/services/fourProp';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { EnquiryMessagingWidgetInView, LastMessagesList, ViewAllMessagesLink } from '@/routes/_auth._com/-ui/EnquiriesPage';
import TabsClipPath from '@/components/TabsClipPath';
import WriteYourReplyHereInput from '@/routes/_auth._com/-ui/WriteYourReplyHereInput';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/Auth/Auth-context';
import { FOURPROP_BASEURL } from '@/services/fourPropClient';

function TableDialog({ model, ...props }) {
    return (
        <Dialog
            open={model.dialogModel.state.open}
            onOpenChange={model.dialogModel.onOpenChange}
            {...props}
        >
            <DialogContent className="transition-all sm:max-w-[900px] min-h-[600px] p-0">
                <DialogTopNavigation model={model} />
                {model.id ? (
                    <Suspense
                        fallback={
                            <p className="inset-0 absolute flex items-center justify-center text-lg opacity-40 font-bold">
                                Loading...
                            </p>
                        }
                    >                    
                        <TableDialogContentRenderer model={model} />
                    </Suspense>
                ) : (
                    <p>Loading...</p>
                )}
            </DialogContent>
        </Dialog>
    )
}

function DialogTopNavigation({ model }) {
    // const { data: info } = useSuspenseQuery(model.infoQueryOptions)
    const resultFromTable = useTableModel.use.getResultFromTable(model)
    const info = resultFromTable?.row.original
    const { authUserId } = resultFromTable?.table.options.meta ?? {}
    const isYou = info?.owneruid === authUserId

    return (
        <>
            <div className='absolute -translate-y-[calc(100%+1rem)] w-full flex items-end gap-8'>
                {info && (
                    <div className='flex flex-col items-start gap-1 w-1/3'>
                        {info?.owneruid && (
                            isYou ? (
                                <span className='text-white/80 text-xs'>
                                    Your client
                                </span>
                            ) : (
                                <span className='text-white/80 text-xs'>
                                    Client of {info.owner_first} {info.owner_last}
                                </span>
                            )
                        )}
                        <div className='flex items-center gap-3'>
                            <div className='font-bold text-lg text-white capitalize text-nowrap truncate'>
                                {info.first} {info.last}
                            </div>
                            <div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="link"
                                            className="size-5 p-0 rounded-full bg-emerald-500 text-emerald-950"
                                            size="sm"
                                            >
                                            <DotsHorizontalIcon className="size-3" />
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
                            </div>
                        </div>
                    </div>
                )}
                {model.dialogTabs && (
                    <div className='flex justify-center w-1/3'>
                        <TabsClipPath 
                            tabs={model.dialogTabs} 
                            activeTab={model.tabValue} 
                            onSelect={model.onTabValueChange}
                        />
                    </div>
                    
                )}
            </div>
            <div className='absolute top-0 -right-10 h-full flex flex-col justify-between items-center gap-4'>
                <X 
                    className='size-5 text-white cursor-pointer' 
                    onClick={() => model.dialogModel.onOpenChange(false)} 
                />
                {resultFromTable && (
                    <DialogNavigation fromTableInfo={resultFromTable} />
                )}
            </div>
        </>
    )
}

function TableDialogContentRenderer ({ model }) {
    const { data } = useSuspenseQuery(model.infoQueryOptions)
    return <TableDialogContent info={data} model={model} />
}

const panelDefaultSize = {
    info: 40,
    other: 50
}

const ResizeableLeftSide = ({ info, model }) => {
    const { metricsComponent: MetricsComponent } = model
    return (
        <MetricsComponent 
            info={info} 
            model={model} 
            className="flex-grow" 
        />
    )
}

const TwoColumnResizeable = ({ autoSaveId, info, model, rightsideContent }) => {
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
                        "transition-opacity ease-in duration-700 rounded-lg",
                        isMount ? "opacity-100" : "opacity-0"
                    )}
                    onLayout={handleLayoutChange}
                >
                    <ResizablePanel
                        ref={refA}
                        defaultSize={leftDefaultSize}
                        minSize={40}
                        maxSize={60}
                        className="flex flex-col gap-4 py-2"
                    >
                        <ResizeableLeftSide 
                            info={info}
                            model={model}
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
    const auth = useAuth()
    const stats = useSuspenseQuery(model.enquiriesQueryOptions(info.owneruid, {
        suitables: model.openEnquiry.suitables,
        shared: model.openEnquiry.shared
    }))

    const [carouselApi, setCarouselApi] = React.useState(null)
    
    const { data } = useSuspenseQuery(propertyEnquiriesQuery(stats.data))

    const row = data.find((item) => item.id === model.openEnquiry.pid)

    if (!row) return null

    return (
        <div className='flex flex-col gap-2 h-full bg-cyan-400'>
            <div>
                <div className='flex items-center justify-between gap-3 p-3 bg-white shadow-xl relative z-10'>
                    <Button 
                        variant="secondary" 
                        size="xs"
                    >
                        <a 
                            href={`${FOURPROP_BASEURL}/view-details/${row.id}`} 
                            target="__blank"
                        >
                            <span className='align-middle mr-1'>View details</span>
                            <ExternalLinkIcon className='size-3 inline opacity-40'/>
                        </a>
                    </Button>
                    <div className='flex items-center gap-1'>
                        <Button 
                            onClick={() => carouselApi?.scrollPrev()} 
                            variant="outline" 
                            size="xs" 
                            className="rounded-full p-0 size-8"
                        >
                            <ChevronLeft className="size-4" />
                            <span className="sr-only">Next slide</span>
                        </Button>
                        <Button 
                            onClick={() => carouselApi?.scrollNext()} 
                            variant="outline" 
                            size="xs"
                            className="rounded-full p-0 size-8"
                        >
                            <ChevronRight className="size-4" />
                            <span className="sr-only">Next slide</span>
                        </Button>
                    </div>
                </div>
                <Carousel setApi={setCarouselApi} className="overflow-hidden">
                    <CarouselContent>
                        {row.pictures.full.map((source, index) => (
                            <CarouselItem key={index}>
                                <div className="relative overflow-hidden h-64">
                                    <img src={source} className="object-contain w-full h-full z-10 relative" />
                                    <img src={source} className="object-cover w-full h-full scale-[2] absolute left-0 top-0 z-0 blur-3xl" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
            <Suspense fallback={<p className='text-white opacity-50 text-sm p-3'>Loading...</p>}>
                <div className='flex flex-col flex-1 gap-0'>
                    <ViewAllMessagesLink 
                        chat_id={row.chat_id} 
                        bz_hash={info.hash_bz} 
                        dteam={auth.bzUserId}
                        className="py-1"
                    />
                    <div className='flex flex-col-reverse gap-4 px-3 mt-auto'>
                        <LastMessagesList 
                            ownerNid={info.ownernid}
                            chat_id={row.chat_id}
                            recipientLabel="client"
                        />
                    </div>
                    <div className='p-1 sm:p-3'>
                        <WriteYourReplyHereInput 
                            chat_id={row.chat_id}
                            ownerNid={info.ownernid}
                            property={row} 
                        />
                    </div>
                    {info.ownernid !== auth.bzUserId.replace('N', '') && (
                        <div className="text-center bg-sky-200 text-sky-800 text-sm px-3 py-2">
                            <b>Resume chat for</b> {info.owner_first} {info.owner_last}
                        </div>
                    )}
                </div>
            </Suspense>
        </div>
    )
}

function TableDialogContent({ info, model }) {
    const {
        authUserId,
        chatboxQueryOptions,
        renderMessages,
        addMutationOptions,
        deleteMutationOptions,
        tabValue
    } = model

    const enableBizchat = model.getBzId(info)

    return tabValue?.id === "info" ? (
        <TwoColumnResizeable 
            autoSaveId={tabValue.id}
            info={info}
            model={model}
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
            rightsideContent={
                model.openEnquiry && (
                    <EnquiriesSharedRightSide model={model} info={info} />
                )
            }
        />
    )
}

export default TableDialog