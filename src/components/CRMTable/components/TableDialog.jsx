import React, { Suspense } from 'react';
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

function TableDialogContent({ info, model, fromTable = null }) {
    const {
        authUserId,
        chatboxQueryOptions,
        renderMessages,
        addMutationOptions,
        deleteMutationOptions,
        metricsComponent: MetricsComponent,
        enableBizchat
    } = model

    return (
        <CSSOnMount
            render={(isMount) => (
                <ResizablePanelGroup
                    direction="horizontal"
                    className={cx(
                        "transition-opacity ease-in duration-700",
                        isMount ? "opacity-100" : "opacity-0"
                    )}
                >
                    <ResizablePanel
                        defaultSize={40}
                        minSize={30}
                        maxSize={50}
                        className="p-4 space-y-4"
                    >
                        <DialogHeader>
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
                        <MetricsComponent info={info} model={model} />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={60}>
                        {authUserId === info.id ? (
                            <div className="h-full bg-slate-100">
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
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        />
    )
}

export default TableDialog