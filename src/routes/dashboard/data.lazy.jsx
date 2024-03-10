import { Link, Outlet, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute('/dashboard/data')({
    component: ListComponent
})

function ListComponent () {
    return (
        <>
            <div className='flex justify-center gap-4 px-4 mb-4'>
                <Link to="each/list" className="[&.active]:font-bold">
                    EACH
                </Link>
                <Link to="clients/list" className="[&.active]:font-bold">
                    Clients
                </Link>
            </div>
            <Outlet />
        </>
    )
}