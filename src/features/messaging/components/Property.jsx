import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import PropertyCompany from "./PropertyCompany"
import { BadgePoundSterlingIcon, Loader2Icon, RulerIcon } from "lucide-react"
import { RulerHorizontalIcon, RulerSquareIcon } from "@radix-ui/react-icons"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import Grading from "./Grading"
import Choices from "./Choices"
import { Suspense, useState } from "react"
import SearchReferenceSelect from "@/features/searchReference/component/SearchReferenceSelect"
import { FOURPROP_BASEURL } from "@/services/fourPropClient"
import Nl2br from "@/components/Nl2br/Nl2br"
import { Button } from "@/components/ui/button"
import { useSet } from "@uidotdev/usehooks"
import { EnquiryMessagingWidgetInView } from "@/routes/_auth._com/-ui/EnquiriesPage"
import SearchReferenceButton from "@/features/searchReference/component/SearchReferenceButton"
import useBreakpoint from "@/hooks/use-TailwindBreakpoint"

const activeClassName = "border-green-500 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-500 font-bold"

const Property = ({ row, isAgent, bz_hash, onGradeChange, onDealingAgentFirstMessage }) => {

    const breakpoint = useBreakpoint()

    const [active, setActive] = useState(0)

    const position = [row.lat, row.lng]
    
    return (
        <div className="pb-0 sm:pb-10">
            {row.enquired.isEnquiry && (
                <div className="bg-sky-100">
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mx-auto max-w-7xl px-2 sm:px-16 py-2 sm:py-4">
                        <p className="text-sky-800 text-xs sm:text-sm">
                            <b>Welcome {isAgent ? "Agent": "visitor"}, </b>
                            {row.enquired?.from_uid ? (  
                                `an agent shared this property with you`
                            ) : row.enquired?.client ? (
                                row.enquired?.client.isGradeShare 
                                    ? "You shared this property with"
                                    : "This property was enquired by"
                            ) : (
                                "You enquired about this property"
                            )}
                        </p>
                        {row.enquired.client && (
                            <div className='flex gap-2 items-center text-xs sm:text-sm'>
                                <div>{row.enquired.client.display_name}</div>
                                <div 
                                    className='bg-slate-50 size-5 rounded-full overflow-hidden flex justify-center items-center self-start'
                                >
                                    <img 
                                        src={`${FOURPROP_BASEURL}${row.enquired.client.avatar}`} 
                                        className='max-h-20 object-cover' 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="sm:px-16 px-2 max-w-7xl mx-auto sm:my-4 my-1 flex gap-4">
                <div className="mr-auto flex gap-2 items-center">
                    <CompanyLogo logo={row.enquired.brand.logo} />
                    <span className="text-nowrap font-bold text-sm">{row.enquired.brand.name}</span>
                </div>
            </div>
            <div className="sm:px-16 px-2 max-w-7xl mx-auto relative">
                <Carousel>
                    <CarouselContent>
                        {row.pictures.full.map((source, index) => (
                            <CarouselItem key={index}>
                                <div className="relative h-[250px] sm:h-[450px] overflow-hidden rounded-xl">
                                    <img src={source} className="object-contain w-full h-full z-10 relative" />
                                    <img src={source} className="object-cover w-full h-full scale-[2] absolute left-0 top-0 z-0 blur-3xl" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {breakpoint !== "sm" && (
                        <>
                            <CarouselPrevious />
                            <CarouselNext />
                        </>
                    )}
                </Carousel>
                {row.grade && (
                    <div className="absolute top-2 sm:top-4 left-4 sm:left-20 p-2 sm:p-4 bg-white rounded-md shadow-lg">
                        <Grading 
                            row={row} 
                            isAgent={isAgent} 
                            onGradeChange={onGradeChange} 
                        />
                    </div>
                )}
                {row.enquired.isEnquiry && (
                    <div className="absolute top-2 right-4 sm:top-4 sm:right-20 p-1 bg-gray-900/40 rounded-md shadow-lg">
                        {isAgent ? (
                            <SearchReferenceButton>
                                <div className='px-2 py-1 flex-1 hover:underline'>
                                    {row.tag_name ? row.tag_name: "Unnamed"}
                                </div>
                            </SearchReferenceButton>
                        ) : (
                            <Suspense fallback={<Loader2Icon className="animate-spin" />}>
                                <SearchReferenceSelect 
                                    pid={row.id}
                                    tag_id={row.tag_id} 
                                    isAgent={isAgent}
                                />
                            </Suspense>   
                        )}
                    </div>
                )}
            </div>
            <div className="bg-slate-100 sm:pb-12 -mt-4 sm:-mt-20 py-10 sm:py-28 mb-4 sm:mb-16 px-4 sm:px-0">
                <div className="max-w-3xl mx-auto flex items-center flex-col gap-4 sm:gap-8 bg-slate-100">
                    <h1 className="text-2xl sm:text-4xl leading-snug text-center font-thin max-w-xl">
                        {row.title}
                    </h1>
                    <div className='text-sm sm:text-lg font-normal flex gap-8 sm:gap-10'>                  
                        <div className="flex gap-4 items-center">
                            <RulerSquareIcon strokeWidth={1} className="text-red-500 size-4 sm:size-8 opacity-50"/> 
                            <span>{row.sizeText}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <BadgePoundSterlingIcon strokeWidth={1} className="text-amber-500 size-6 sm:size-12"/> 
                            <span>{row.tenureText}</span>
                        </div>
                    </div>
                </div>
            </div>
            {row.enquired.client ? (
                <div className="sm:mx-auto mx-2 max-w-5xl mb-8 border rounded-lg shadow-sm">
                    {row.enquired.client.isGradeShare && (
                        <div className='flex gap-1 sm:gap-4 justify-stretch px-2 sm:px-4 pt-2 sm:pt-4'>
                            {["Applicant messages", "Letting agent messages"].filter((_, index) => {
                                if (row.enquired.client.isGradeShare) return true
                                return index !== 1 
                            }).map((label, index) => (
                                <Button 
                                    key={index}
                                    variant="outline" 
                                    className={cn("text-xs sm:text-sm p-2 sm:p-6 w-full", { [activeClassName]: active === index })}
                                    onClick={() => {
                                        setActive(index)
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    )}
                    <div className="p-2 sm:p-4">
                        {row.enquired.client.isGradeShare && active === 1 ? (
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">                           
                                <div className="sm:w-1/3 sm:p-8 rounded-lg">
                                    <div className="space-y-1">
                                        <CompanyLogo logo={row.enquired.company.logo.original} />
                                        <div className='text-base text-center'>{row.enquired.company.name}</div>
                                        <div className='text-base text-center'>{row.enquired.company.phone}</div>
                                    </div>
                                </div>
                                <div className="grow">
                                    <EnquiryMessagingWidgetInView 
                                        bz_hash={bz_hash}
                                        property={row}
                                        chat_id={row.original.dealing_agents_chat_id}
                                        onDealingAgentFirstMessage={onDealingAgentFirstMessage}
                                        recipientLabel="property agent"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">                            
                                <div className="sm:w-1/3 p-4 rounded-lg space-y-2 sm:space-y-4">
                                    <div className="text-lg font-thin">
                                        {row.enquired.client.isGradeShare 
                                            ? "Message applicant"
                                            : "Message client"}
                                    </div>
                                    <div className="flex gap-4">
                                        <div 
                                            className='bg-slate-50 size-14 overflow-hidden flex justify-center items-center self-start'
                                        >
                                            <img 
                                                src={`${FOURPROP_BASEURL}${row.enquired.client.avatar}`} 
                                                className='max-h-20 object-cover' 
                                            />
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <div className="font-bold">{row.enquired.client.display_name}</div>
                                            <div>{row.enquired.client.email}</div>
                                            <div>{row.enquired.client.phone}</div>
                                        </div>
                                    </div>
                                    <Choices choices={row.enquiry_choices} className="flex-col gap-1" />
                                </div>
                                <div className="grow">
                                    <EnquiryMessagingWidgetInView 
                                        bz_hash={bz_hash}
                                        property={row}
                                        chat_id={row.chat_id} 
                                        recipientLabel={
                                            row.enquired.agent_to_agent 
                                                ? "agent"
                                                : row.enquired.client.isGradeShare 
                                                    ? "applicant"
                                                    : "client"
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-5xl flex flex-col sm:flex-row gap-2 sm:gap-8 mx-2 sm:mx-auto px-2 sm:px-4 sm:py-4 pb-2 mb-8 border rounded-lg shadow-sm">
                    <div className="p-4 space-y-2 sm:w-1/3">
                        <div className="text-lg font-thin">
                            Message agent
                        </div>
                        <p>
                            {row.enquired?.from_uid ? (
                                `${row.enquired.company.name} shared this property with you`
                            ) : (
                                "You enquired about this property"
                            )}
                        </p>
                        <Choices choices={row.enquiry_choices} className="flex-col gap-1" />
                    </div>
                    <div className="grow">
                        <EnquiryMessagingWidgetInView 
                            bz_hash={bz_hash}
                            property={row}
                            chat_id={row.chat_id} 
                            recipientLabel={row.enquired.agent_to_agent ? "agent": "client"}
                        />
                    </div>
                </div>
            )}

            <main className="flex flex-col-reverse sm:flex-row sm:items-start gap-8 sm:gap-16 max-w-5xl sm:mx-auto mx-2 border p-8">
                <article className="space-y-8 w-full sm:p-8">
                    <div className="space-y-3">
                        <h2 className="text-lg font-thin">
                            Property description
                        </h2>
                        <p className="leading-relaxed">
                            <Nl2br text={row.content.description} fallbackText={row.title} />
                        </p>
                    </div>
                    {row.content.amenities && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-thin">
                                Amenities
                            </h2>
                            <Nl2br text={row.content.amenities} />
                        </div>
                    )}
                </article>
                <aside className="sm:w-1/2 sm:border-l sm:px-8 sm:py-4">
                    <div className="space-y-1">
                        <CompanyLogo logo={row.enquired.brand.logo} />
                        <div className='text-base text-center'>{row.enquired.brand.name}</div>
                        <div className='text-base text-center'>{row.enquired.brand.phone}</div>
                    </div>
                </aside>
            </main>
            <div className="h-4 sm:h-20"></div>
            <section className="flex flex-col-reverse sm:flex-row max-w-7xl mx-auto bg-blue-900 text-white sm:shadow-lg sm:rounded-md overflow-hidden">
                <div className="space-y-4 sm:w-2/3 p-4 sm:p-14">
                    <h3 className="font-bold text-lg leading-tight sm:text-2xl">
                        {row.addressText}
                    </h3>
                    <p className="leading-relaxed">
                        <Nl2br text={row.content.location} fallbackText={row.enquired.brand.name} />
                    </p>
                </div>
                <div className="sm:w-1/3 relative z-0">
                    <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-64 sm:h-96 w-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position}>
                            <Popup>
                                A pretty CSS3 popup. <br /> Easily customizable.
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </section>
        </div>
    )
}

const CompanyLogo = ({ logo }) => {
    return logo ? (
        <div className='p-2 w-full flex justify-center items-center self-start'>
            <img src={logo} className='max-h-12 object-cover' />
        </div>
    ) : (
        <div className='bg-slate-50 p-2 flex items-center justify-center font-bold text-slate-400 h-12'>
            <span>No logo</span>
        </div>
    )
}

export default Property