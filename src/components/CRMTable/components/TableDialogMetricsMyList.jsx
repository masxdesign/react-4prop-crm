import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import _, { map, over } from 'lodash';
import { useAuth } from '@/components/Auth/Auth';
import { Ddd, Dddl, Ddl } from '@/components/DisplayData/components'
import ColumnNextContactMyList from './ColumnNextContactMyList';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, CheckIcon, CheckSquare2, CopyIcon, ExternalLinkIcon, HomeIcon, Loader2, Loader2Icon, Star, X } from 'lucide-react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Route as AuthDashboardListImportidSharedImport } from '@/routes/_auth._dashboard._layout-1/list_.$import_id.shared'
import { crmGenHash } from '@/services/bizchat';
import queryClient from '@/queryClient';
import { util_pagin_update } from '@/utils/localStorageController';
import { FOURPROP_BASEURL } from '@/services/fourPropClient';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { propertyEnquiriesQuery } from '@/services/fourProp';
import GradingWidget from '@/components/GradingWidget';
import { Badge } from '@/components/ui/badge';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { sharedTagListQueryOptions, tagListQueryOptions } from '@/features/tags/queryOptions';
import { searchReferenceListingQuery } from '@/features/searchReference/searchReference.queries';

function TableDialogMetricsMyList({ info, model, className }) {
    const {
        tabValue,
        onTabValueChange,
        dialogTabs,
    } = model 
    
    return (
        <Tabs 
            value={tabValue.id} 
            onValueChange={(active) => onTabValueChange(dialogTabs.find((item) => active === item.id))}
            className={cn('flex flex-col', className)}
        >
            <TabsContent value="info" className="px-4 text-sm space-y-3 flex-1">
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
                                            portalled={false}
                                        />
                                    ),
                                }
                            ]}
                            labelClassName="min-w-[90px]"
                        />
                    </>
                )}
            </TabsContent>
            <TabsContent value="enquiries" className="px-4 text-sm space-y-3 flex-1">
                <p className='text-sm text-muted-foreground'>
                    Enquiries made by this contact
                </p>
                <Suspense fallback={<p>Loading stats...</p>}>
                    <Enquiries info={info} model={model} />
                </Suspense>
            </TabsContent>
            <TabsContent value="shared" className="px-4 text-sm space-y-3 flex-1">
                <p className='text-muted-foreground'>
                    Properties you shared to this contact
                </p>    
                <Enquiries info={info} model={model} shared />
            </TabsContent>
        </Tabs>
    )
}

const CompanyLogo = ({ data }) => {
    return data.logo.original ? (
        <div className='w-full'>
            <img src={data.logo?.original} className='max-h-4 object-cover' />
        </div>
    ) : (
        <div className='max-w-20 overflow-hidden truncate text-nowrap text-slate-400 h-4'>
            {data.name}
        </div>
    )
}

const BadgeTag = ({ tagId }) => {
    const auth = useAuth()

    const { data } = useSuspenseQuery(searchReferenceListingQuery(auth.authUserId))

    return (
        <div className="cursor-pointer text-xs inline-block text-sky-500">
            {data.find(tag => tag.id === tagId)?.name ?? 'Unnamed'}
        </div>
    )
}

const TagPill = ({ active, className, ...props }) => {
    return (
        <div
            className={cn(
                "cursor-pointer py-1 px-2 border text-xs rounded-sm",
                { "bg-sky-50 text-sky-500": active },
                className
            )}
            {...props}
        />
    )
}

const TagList = ({ tagList, tag, onSelect }) => {
    return (
        <>
            <TagPill 
                active={!tag}
                onClick={() => onSelect(null)}
            >
                All
            </TagPill>
            {tagList.map(({ id, name }) => (
                <TagPill 
                    key={id} 
                    active={tag === id}
                    onClick={() => onSelect(tag === id ? null: id)}
                >
                    {name}
                </TagPill>
            ))}
        </>
    )
}

const EnquiriesListNoItems = ({ className, ...props }) => {
    return <div className={cn(
        'text-sm w-full h-3/4 flex justify-center items-center', 
        className
    )} {...props} />
}

const EnquiriesList = ({ model, tag, onSelectTag, shared, info, suitables }) => { 
    const { data: tagList } = useSuspenseQuery(searchReferenceListingQuery(info.owneruid))

    const stats = useSuspenseQuery(model.enquiriesQueryOptions(info.owneruid, {
        suitables,
        shared
    }))

    const { data } = useSuspenseQuery(propertyEnquiriesQuery(stats.data))

    console.log(model.openEnquiry);
    

    const handleOpen = (pid) => {
        model.onOpenEnquiry({ pid, suitables, shared })
    }

    const selectedTag = useMemo(() => {

        return tagList.find(({ id }) => tag === id)

    }, [tagList, tag])

    const filtered = useMemo(() => {

        if (!tag) {
            return data
        }

        return data.filter((row) => {
            return row.original.grade_tag_id === tag
        })

    }, [data, tag])

    return (
        <>
            {data.length > 0 && (
                <div className='overflow-auto h-8 flex gap-1 text-nowrap px-3 -mx-3'>
                    <TagList 
                        tagList={tagList}
                        tag={tag} 
                        onSelect={onSelectTag} 
                    />
                </div>
            )}
            <div className='overflow-auto h-full flex flex-col -mx-4'>
                {filtered.length < 1 && (
                    selectedTag ? (
                        <EnquiriesListNoItems> 
                            <div className='text-center space-y-2'>
                                <div className='opacity-30 font-bold text-xs'>No items</div>
                                <TagPill 
                                    className='inline-block space-x-1'
                                    onClick={() => onSelectTag(null)}
                                >
                                    <X className='inline-block size-3 opacity-60' />
                                    <span>{selectedTag.name}</span>
                                </TagPill>
                            </div>
                        </EnquiriesListNoItems>
                    ) : (
                        <EnquiriesListNoItems>
                            <span className='opacity-30 font-bold'>No items</span>                            
                        </EnquiriesListNoItems>
                    )
                )}
                {filtered.map(({ id, addressText, tenure, firstSubtype, pictures, original, sizeText, tenureText, companies }) => (
                    <div 
                        key={id} 
                        className={cn(
                            'text-xs flex gap-3 border-b py-3 cursor-pointer hover:bg-slate-50 px-4',
                            {
                                'bg-slate-200 hover:bg-slate-200': model.openEnquiry?.pid === id
                            }
                        )}
                        onClick={() => handleOpen(id)}
                    >
                        <div>
                            <GradingWidget 
                                size={12}
                                value={original.grade ?? 0} 
                                className="gap-1"                                       
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            {pictures.thumbs.slice(0, 1).map((source, index) => (
                                <div key={index} className="relative size-16 rounded-sm overflow-hidden">
                                    <img src={source} className="object-contain w-full h-full z-10 relative" />
                                    <img src={source} className="object-cover w-full h-full scale-[2] absolute left-0 top-0 z-0 blur-3xl" />
                                </div>
                            ))}
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div className='flex flex-row items-start gap-1'>
                                <h3>
                                    <span className='font-bold'>{firstSubtype} for {tenure.text}</span> {addressText}
                                </h3>
                                <div>
                                    {original.new_message && (
                                        <div className='flex rounded-full size-5 bg-green-600 text-white'>
                                            <span className='m-auto font-bold text-[9px]'>
                                                1
                                            </span>
                                        </div>
                                    )} 
                                </div>
                            </div>
                            <div className='flex flex-row gap-3 items-end'>
                                <div className='flex-grow flex flex-col gap-1 text-muted-foreground'>
                                    <BadgeTag tagId={original.grade_tag_id} />
                                    <span>
                                        {tenureText}
                                    </span>
                                    <span>
                                        {sizeText}
                                    </span>
                                </div>
                                <div className='flex flex-col items-end gap-1 text-[9px]'>
                                    {shared && (
                                        <div className='text-right'>
                                            <CompanyLogo 
                                                data={companies[0]} 
                                            />
                                        </div>
                                    )}
                                    <div className='flex flex-row gap-2'>
                                        {original.pdf_requested && (
                                            <span className='text-muted-foreground space-x-1 text-nowrap'>
                                                <CheckIcon className='text-green-600 size-3 inline-block' />
                                                <span className='align-middle font-bold'>
                                                    PDF
                                                </span>
                                            </span>
                                        )}
                                        {original.view_requested && (
                                            <span className='text-muted-foreground space-x-1 text-nowrap'>
                                                <CheckIcon className='text-green-600 size-3 inline-block' />
                                                <span className='align-middle font-bold'>
                                                    View
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <div className={cn('space-x-1 text-muted-foreground', { "text-green-600": original.new_message })}>
                                        <span>
                                            {isToday(original.grade_updated) 
                                                ? 'Today'
                                                : isYesterday(original.grade_updated)
                                                ? 'Yesterday'
                                                : format(original.grade_updated, "d/M/yy")}
                                        </span>
                                        <span>
                                            {format(original.grade_updated, "HH:mm")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

const enquiriesTabsButtons = [
    { label: "Suitables", value: true },
    { label: "Rejects", value: false }
]

const Enquiries = ({ info, model, shared }) => {
    const [tag, setTag] = useState(null)
    const [suitables, setSuitables] = useState(true)

    useEffect(() => {
        setTag(null)
    }, [suitables])

    useEffect(() => {
        model.onOpenEnquiry(null)
    }, [tag, suitables, model.tabValue])

    return (
        <div className='flex flex-col gap-3 h-[580px]'>
            <div className='flex gap-6 justify-center'>
                {enquiriesTabsButtons.map(({ label, value }) => (
                    <Button 
                        key={label} 
                        variant="link"
                        size="xs"
                        className={cn("rounded-none hover:no-underline", { "border-b-2 border-slate-950 font-bold": value === suitables })}
                        onClick={() => setSuitables(value)}
                    >
                        {label}
                    </Button>
                ))}
            </div>
            <Suspense 
                fallback={
                    <div className='h-40 w-full flex'>
                        <Loader2Icon className='text-slate-500 animate-spin size-8 m-auto' />
                    </div>
                }
            >
                <EnquiriesList 
                    model={model} 
                    info={info} 
                    suitables={suitables} 
                    shared={shared} 
                    tag={tag}
                    onSelectTag={setTag}
                />
            </Suspense>
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