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

const activeClassName = "border-green-500 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-500 font-bold"

const Property = ({ row, isAgent, bz_hash, onGradeChange, onDealingAgentFirstMessage }) => {

    console.log(row);
    

    const [active, setActive] = useState(0)

    const position = [row.lat, row.lng]
    
    return (
        <div className="pb-10">
            {row.enquired.isEnquiry && (
                <div className="bg-sky-100">
                    <div className="flex justify-center gap-2 mx-auto max-w-7xl px-16 py-4">
                        <p className="text-sky-800 text-sm">
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
                            <div className='flex gap-2 items-center text-sm'>
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
            <div className="px-16 max-w-7xl mx-auto my-4 flex gap-4">
                <div className="mr-auto flex gap-2 items-center">
                    <CompanyLogo logo={row.enquired.brand.logo} />
                    <span className="text-nowrap font-bold text-sm">{row.enquired.brand.name}</span>
                </div>
            </div>
            <div className="px-16 max-w-7xl mx-auto relative">
                <Carousel>
                    <CarouselContent>
                        {row.pictures.full.map((source, index) => (
                            <CarouselItem key={index}>
                                <div className="relative h-[450px] overflow-hidden rounded-xl">
                                    <img src={source} className="object-contain w-full h-full z-10 relative" />
                                    <img src={source} className="object-cover w-full h-full scale-[2] absolute left-0 top-0 z-0 blur-3xl" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
                {row.grade && (
                    <div className="absolute top-4 left-20 p-4 bg-white rounded-md shadow-lg">
                        <Grading 
                            row={row} 
                            isAgent={isAgent} 
                            onGradeChange={onGradeChange} 
                        />
                    </div>
                )}
                {row.enquired.isEnquiry && (
                    <div className="absolute top-4 right-20 p-1 bg-gray-900/40 rounded-md shadow-lg">
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
            <div className="bg-slate-100 pb-12 -mt-20 py-28 mb-16">
                <div className="max-w-3xl mx-auto flex items-center flex-col gap-8 bg-slate-100">
                    <h1 className="text-4xl leading-snug text-center font-thin max-w-xl">
                        {row.title}
                    </h1>
                    <div className='text-lg font-normal flex flex-col sm:flex-row gap-0 sm:gap-10'>                  
                        <div className="flex gap-4 items-center">
                            <RulerSquareIcon strokeWidth={1} className="text-red-500 size-8 opacity-50"/> 
                            <span>{row.sizeText}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <BadgePoundSterlingIcon strokeWidth={1} className="text-amber-500 size-12"/> 
                            <span>{row.tenureText}</span>
                        </div>
                    </div>
                </div>
            </div>
            {row.enquired.client ? (
                <div className="max-w-5xl mx-auto mb-8 border rounded-lg shadow-sm">
                    {row.enquired.client.isGradeShare && (
                        <div className='flex gap-4 justify-stretch px-4 pt-4'>
                            {["Applicant messages", "Letting agent messages"].filter((_, index) => {
                                if (row.enquired.client.isGradeShare) return true
                                return index !== 1 
                            }).map((label, index) => (
                                <Button 
                                    key={index}
                                    variant="outline" 
                                    className={cn("text-sm p-6 w-full", { [activeClassName]: active === index })}
                                    onClick={() => {
                                        setActive(index)
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    )}
                    <div className="p-4">
                        {row.enquired.client.isGradeShare && active === 1 ? (
                            <div className="flex gap-8">                           
                                <div className="w-1/3 p-8 rounded-lg">
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
                            <div className="flex gap-8">                            
                                <div className="w-1/3 p-4 rounded-lg space-y-4">
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
                <div className="max-w-5xl flex gap-8 mx-auto p-4 mb-8 border rounded-lg shadow-sm">
                    <div className="p-4 space-y-2 w-1/3">
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

            <main className="flex items-start gap-16 max-w-5xl mx-auto border p-8">
                <article className="space-y-8 w-full p-8">
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
                <aside className="w-1/2 border-l px-8 py-4">
                    <div className="space-y-1">
                        <CompanyLogo logo={row.enquired.brand.logo} />
                        <div className='text-base text-center'>{row.enquired.brand.name}</div>
                        <div className='text-base text-center'>{row.enquired.brand.phone}</div>
                    </div>
                </aside>
            </main>
            <div className="h-20"></div>
            <section className="flex max-w-7xl mx-auto bg-blue-900 text-white shadow-lg rounded-md overflow-hidden">
                <div className="space-y-4 w-2/3 p-14">
                    <h3 className="font-bold text-2xl">
                        {row.addressText}
                    </h3>
                    <p className="leading-relaxed">
                        <Nl2br text={row.content.location} fallbackText={row.enquired.brand.name} />
                    </p>
                </div>
                <div className="w-1/3 relative z-0">
                    <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-96 w-full">
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