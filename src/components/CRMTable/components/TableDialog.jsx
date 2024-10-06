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
                        <TableDialogMetrics info={info} model={model} />
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

function TableDialogMetrics({ info, model }) {
    return (
        <div className="text-sm space-y-2">
            <Dddl
                items={[
                    { label: "Email", name: "email" },
                    { label: "Company", name: "company", bold: true },
                    {
                        label: "Co. type",
                        name: "type",
                        names: COMPANY_TYPE_NAMES,
                    },
                    { label: "Department", name: "department" },
                    { label: "Position", name: "position", alwaysShow: true },
                    { label: "Website", name: "website" },
                    { label: "Phone", name: "phone" },
                    { label: "Mobile", name: "mobile" },
                ]}
                row={info}
            />
            <div className="h-3" />
            <Suspense fallback={<p>Loading...</p>}>
                <DialogBranchEach
                    chatboxQueryOptions={model.chatboxQueryOptions}
                />
            </Suspense>
            {model.authUserId !== info.id && (
                <>
                    <div className="h-3" />
                    <Ddl
                        items={[
                            {
                                label: "Next contact",
                                value: (
                                    <ColumnNextContactEach
                                        id={info.id}
                                        defaultValue={info.next_contact}
                                    />
                                ),
                            },
                            {
                                label: "Last contact",
                                value: (
                                    <LastContact value={info.last_contact} />
                                ),
                                show: !isEmpty(info.last_contact),
                            },
                        ]}
                        labelClassName="min-w-[90px]"
                    />
                </>
            )}
            <Suspense fallback={<p>Loading...</p>}>
                <TableDialogChatLinks
                    chatboxQueryOptions={model.chatboxQueryOptions}
                />
            </Suspense>
            <div className="h-12" />
            <div className="flex flex-col gap-4">
                <Dd
                    label="Alert"
                    value={<AlertEmailClick info={info} showDate />}
                />
                <div className="flex flex-row gap-8 justify-center">
                    {[
                        { label: "Opened", name: "openedPerc" },
                        { label: "Success", name: "alertPerc" },
                    ].map(({ label, name }) => (
                        <div
                            key={name}
                            className="flex flex-col items-center gap-1"
                        >
                            <ProgressCircle size="lg" perc={info[name] ?? 0} />
                            <span className="text-muted-foreground font-bold text-sm">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function TableDialogChatLinks({ chatboxQueryOptions }) {
    const { user } = useAuth()
    const { data } = useSuspenseQuery(chatboxQueryOptions)

    const [_, __, ___, lastMessage, mailshots] = data

    return (
        <div className="space-y-3">
            {lastMessage && (
                <Ddd
                    row={{
                        link: (
                            <a
                                href={`/bizchat/rooms/${lastMessage.chat_id}?i=${user.bz_hash}`}
                                className="text-sky-700 hover:underline inline-flex bg-sky-50 items-center justify-center text-xs h-7 px-2.5 py-0.5 rounded-md"
                                target="__blank"
                            >
                                View all messages
                            </a>
                        ),
                    }}
                    label="Bizchat"
                    name="link"
                />
            )}
            {mailshots.length > 0 && (
                <Ddl
                    items={[
                        {
                            label: "Last mailshot",
                            value: [mailshots[0]].map((item) => (
                                <Button
                                    key={item.id}
                                    variant="link"
                                    size="xs"
                                    asChild
                                >
                                    <a
                                        href={item.link}
                                        target="__blank"
                                        className="text-orange-500 bg-orange-50"
                                    >
                                        {item.template_name}
                                    </a>
                                </Button>
                            )),
                            disableTruncate: true,
                        },
                    ]}
                />
            )}
        </div>
    )
}

function DialogBranchEach({ chatboxQueryOptions }) {
    const { data } = useSuspenseQuery(chatboxQueryOptions)

    const [_, branch] = data

    return (
        <Collapsible className="space-y-2">
            <CollapsibleTrigger asChild>
                <Ddd row={branch} label="Branch" name="name" bold collapsible />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
                <Dddl
                    items={[
                        { label: "Phone", name: "phone" },
                        { label: "Address", name: "address" },
                        { label: "County", name: "county" },
                        { label: "City", name: "towncity" },
                        { label: "Poscode", name: "postcode" },
                    ]}
                    row={branch}
                />
            </CollapsibleContent>
        </Collapsible>
    )
}

export default TableDialog