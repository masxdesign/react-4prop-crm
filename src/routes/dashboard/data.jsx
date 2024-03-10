import { createFileRoute } from "@tanstack/react-router";
import PendingComponent from "./-components/PendingComponent";

export const Route = createFileRoute('/dashboard/data')({
    pendingComponent: PendingComponent
})