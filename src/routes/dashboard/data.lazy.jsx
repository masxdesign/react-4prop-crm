import { Link, Outlet, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute('/dashboard/data')({
    component: ListComponent
})

function ListComponent () {
    return (
        <>
            <Outlet />
        </>
    )
}