import React, { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { cx } from 'class-variance-authority';
import _, { isEmpty } from 'lodash';
import useTableModel from '@/hooks/use-TableModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/components/Auth/Auth-context';
import { Button } from '@/components/ui/button';
import ProgressCircle from '@/components/ProgressCircle';
import { Ddd, Dd, Dddl, Ddl } from '@/components/DisplayData/components'
import { AlertEmailClick, ColumnNextContactEach, LastContact } from '@/components/CRMTable/components';
import { COMPANY_TYPE_NAMES } from '@/constants';
import Chatbox from './Chatbox';
import CSSOnMount from './CSSOnMount';
import DialogNavigation from '@/components/DialogNavigation';

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
        metricsComponent: MetricsComponent
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
                            <DialogTitle className="flex flex-row justify-between items-center capitalize">
                                <span>{`${info.first} ${info.last}`}</span>
                                {fromTable && (
                                    <DialogNavigation info={fromTable} />
                                )}
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
                                chatboxQueryOptions={chatboxQueryOptions}
                                addMutationOptions={addMutationOptions}
                                deleteMutationOptions={deleteMutationOptions}
                                renderMessages={renderMessages}
                                enableDelete={false}
                            />
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        />
    )
}

export default TableDialog