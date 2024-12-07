import React, { Suspense, useEffect, useState } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useAuth } from '@/components/Auth/Auth-context';
import { Ddd, Dddl, Ddl } from '@/components/DisplayData/components'
import ColumnNextContactMyList from './ColumnNextContactMyList';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, CheckIcon, CopyIcon, ExternalLinkIcon, HomeIcon, Loader2, Star } from 'lucide-react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Route as AuthDashboardListImportidSharedImport } from '@/routes//_auth._dashboard/list_.$import_id.shared'
import { crmGenHash } from '@/services/bizchat';
import queryClient from '@/queryClient';
import { util_pagin_update } from '@/utils/localStorageController';
import { FOURPROP_BASEURL } from '@/services/fourPropClient';

function TableDialogMetricsMyList({ info, model }) {

    const { location } = useRouterState()

    return (
        <div className="text-sm space-y-3">
            <Dddl
                items={[
                    { label: "First", name: "first", editable: true, alwaysShow: true },
                    { label: "Surname", name: "last", editable: true, alwaysShow: true },
                    { label: "Email", name: "email", editable: true, alwaysShow: true },
                    { label: "Company", name: "company", bold: true, editable: true, alwaysShow: true },
                    { label: "Phone", name: "phone", editable: true, alwaysShow: true },
                    { label: "Created", name: "created", editable: false, alwaysShow: true, isDate: true }
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
            {model.enableBizchat && (
                <Suspense fallback={<p>Loading...</p>}>
                    <TableDialogChatLinks
                        chatboxQueryOptions={model.chatboxQueryOptions}
                    />
                </Suspense>
            )}
            <div className="h-3" />
            {info.gradesharecount > 0 && (
                <div className='flex gap-3 items-center justify-start'>
                    <span className='inline-flex gap-1 text-yellow-700'>
                        <Star className='w-4 h-4 self-center' />
                        You shared
                    </span>
                    <Button size="xs" asChild>
                        <Link 
                            to={AuthDashboardListImportidSharedImport.to} 
                            params={{ import_id: info.id }}
                            state={{ lastLocation: location, info }}
                            className='space-x-1'
                        >
                            <span>{info.gradesharecount} </span>
                            <HomeIcon className='w-3 h-3' />
                        </Link>
                    </Button>
                    <CopyAccessLinkButton info={info} model={model} />
                </div>
            )}
        </div>
    )
}

function CopyAccessLinkButton ({ info, model }) {
    const [copied, setCopied] = useState(false)
    
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { dataQueryKey } = model.table.options.meta

    const auth = useAuth()

    const genHash = useMutation({
        mutationFn: import_id => crmGenHash(auth.authUserId, import_id)
    })

    useEffect(() => {

        if (copied) {

            const t = setTimeout(() => {
                setCopied(false)
            }, 700)

            return () => {
                clearTimeout(t)
            }
        }

    }, [copied])

    const handleClick = async e => {

        let hash = info.hash

        if (!hash) {

            const data = await genHash.mutateAsync(info.id)
            
            hash = data.hash
            queryClient.setQueryData(dataQueryKey, util_pagin_update({ id: info.id }, { hash }))

        }


        const pathname = `/crm/access/${hash}/${auth.authUserId}/shared`

        if (e.target.dataset.open) {
            window.open(pathname, `4prop-crm-access-${hash}-${auth.authUserId}-shared`)
            // navigate({ to: pathname })
            return
        }
        
        setCopied(true)
        navigator.clipboard.writeText(`${FOURPROP_BASEURL}${pathname}`)
    }

    return (
        <div className='flex items-center gap-4'>
            <Button 
                size="xs" 
                variant="outline"
                className="flex gap-2" 
                onClick={handleClick}
            >
                {genHash.isPending ? (
                    <Loader2 className='animate-spin w-3 h-3' />
                ) : copied ? (
                    <CheckCircleIcon className='w-3 h-3' />
                ) : (
                    <CopyIcon className='w-3 h-3' />
                )}
                <span>Access link</span>
            </Button>
            <ExternalLinkIcon 
                data-open={true}
                onClick={handleClick} 
                className='w-3 h-3 cursor-pointer' 
            />
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