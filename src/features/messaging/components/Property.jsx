import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import PropertyCompany from "./PropertyCompany"

const Property = ({ data }) => {
    const { list, refetch, isFetched, isRefetching } = data
    const row = list[0]

    console.log(row.pictures.full);
    
    
    return (
        <div className="space-y-12">
            <div className="px-16 py-8 max-w-7xl mx-auto space-y-8">
                <Carousel>
                    <CarouselContent>
                        {row.pictures.full.map((source, index) => (
                            <CarouselItem key={index} className="max-h-[420px] bg-slate-100">
                                <img src={source} className="object-contain w-full h-full" />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
                <div className="max-w-3xl mx-auto flex items-center flex-col gap-4">
                    <div className='flex flex-col sm:flex-row gap-0 sm:gap-3'>
                        <div className={cn("font-bold", { 
                            "text-green-600": row.statusColor === "green",
                            "text-amber-600": row.statusColor === "amber",
                            "text-sky-600": row.statusColor === "sky",
                            "text-red-600": row.statusColor === "red",
                        })}>
                            {row.statusText}
                        </div>
                        <div>{row.sizeText}</div>
                        <div>{row.tenureText}</div>
                    </div>
                    <h1 className="text-3xl text-center font-bold w-3/4">
                        {row.title}
                    </h1>
                </div>
            </div>
            <main className="flex items-start gap-16 max-w-4xl mx-auto">
                <article className="space-y-8 w-3/5">
                    <div className="">
                        {row.content.description}
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-xl">Location</h3>
                        <p>{row.content.location}</p>
                    </div>
                    <div>
                        {row.content.amenities}
                    </div>
                </article>
                <aside className="grow py-8">
                    <div className="space-y-2">
                        <div className='text-lg font-bold text-center'>{row.enquired.company.name}</div>
                        {row.enquired.company.logo.original ? (
                            <div className='bg-slate-50 p-2 w-full flex justify-center items-center self-start'>
                                <img src={row.enquired.company.logo.original} className='max-h-12 object-cover' />
                            </div>
                        ) : (
                            <div className='bg-slate-50 p-2 flex items-center justify-center font-bold text-slate-400 h-12'>
                                <span>No logo</span>
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    )
}

export default Property