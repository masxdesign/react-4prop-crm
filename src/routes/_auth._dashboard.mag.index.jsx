import React, { useState } from "react"
import { createFileRoute, useParams, useSearch, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/components/Auth/Auth"
import AgentPropertiesTable from "@/components/Magazine/AgentPropertiesTable/AgentPropertiesTable"
import AgentPaginatedTable from "@/components/Magazine/AgentPropertiesTable/AgentPaginatedTable"

export const Route = createFileRoute("/_auth/_dashboard/mag/")({
    validateSearch: (search) => ({
        page: search.page ? Number(search.page) : 1,
        pageSize: search.pageSize ? Number(search.pageSize) : 10,
    }),
    component: () => {
        // Get agent ID from URL params or however you're passing it
        const auth = useAuth()
        const search = useSearch({ from: "/_auth/_dashboard/mag/" })
        const navigate = useNavigate({ from: "/_auth/_dashboard/mag/" })

        // Pagination handlers
        const onPageChange = (page) => {
            navigate({ search: { ...search, page } })
        }

        const onPageSizeChange = (pageSize) => {
            navigate({ search: { ...search, pageSize, page: 1 } })
        }

        // You can also get it from other sources based on your app structure:
        // const agentId = someGlobalState.currentAgentId;
        // const agentId = props.agentId;

        if (!auth.user.neg_id) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Invalid Agent ID
                        </h2>
                        <p className="text-gray-600">Agent ID is required.</p>
                    </div>
                </div>
            )
        }

        return (
            <AgentPaginatedTable 
                agentId={auth.user.neg_id}
                page={search.page}
                pageSize={search.pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />
        )
    },
})