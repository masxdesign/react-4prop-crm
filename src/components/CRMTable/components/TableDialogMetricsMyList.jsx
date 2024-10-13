import React, { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useAuth } from '@/components/Auth/Auth-context';
import { Ddd, Dddl, Ddl } from '@/components/DisplayData/components'
import ColumnNextContactMyList from './ColumnNextContactMyList';

function TableDialogMetricsMyList({ info, model }) {
    return (
        <div className="text-sm space-y-2">
            <Dddl
                items={[
                    { label: "First", name: "first", editable: true, alwaysShow: true },
                    { label: "Surname", name: "last", editable: true, alwaysShow: true },
                    { label: "Email", name: "email", editable: true, alwaysShow: true },
                    { label: "Company", name: "company", bold: true, editable: true, alwaysShow: true },
                    { label: "Phone", name: "phone", editable: true, alwaysShow: true },
                    { label: "Created", name: "created", alwaysShow: true, isDate: true },
                ]}
                row={info}
                updateMutationOptions={model.updateMutationOptions}
            />
            <div className="h-3" />
            {model.authUserId !== info.id && (
                <>
                    <div className="h-3" />
                    <Ddl
                        items={[
                            {
                                label: "Next contact",
                                value: (
                                    <ColumnNextContactMyList
                                        importId={info.id}
                                        authUserId={model.authUserId}
                                        defaultValue={info.next_contact}
                                        table={model.table}
                                        tableDataQueryKey={model.table.options.meta.dataQueryKey}
                                    />
                                ),
                            }
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
        </div>
    )
}

function TableDialogChatLinks({ chatboxQueryOptions }) {
    const { user } = useAuth()
    const { data } = useSuspenseQuery(chatboxQueryOptions)

    const [_, __, ___, lastMessage] = data

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
        </div>
    )
}

export default TableDialogMetricsMyList