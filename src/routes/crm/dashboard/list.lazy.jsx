import { Outlet, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute('/crm/dashboard/list')({
    component: ListComponent
})

function ListComponent () {
    return (
        <>
            <p>hello</p>
            <Outlet />
        </>
    )
}