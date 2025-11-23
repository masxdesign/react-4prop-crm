import React, { useState } from "react"
import { createFileRoute, useParams, useSearch, useNavigate, useRouterState } from "@tanstack/react-router"
import { useAuth } from "@/components/Auth/Auth"
import AgentPaginatedTable from "@/components/Magazine/AgentPropertiesTable/AgentPaginatedTable"
import { fetchAgentPaginatedProperties } from "@/components/Magazine/api"
import AgentPaginatedEnhancedTable from "@/components/Magazine/AgentPropertiesTable/AgentPaginatedEnhancedTable"

export const Route = createFileRoute("/_auth/_dashboard/mag/")({
    validateSearch: (search) => ({
        page: search.page ? Number(search.page) : 1,
        pageSize: search.pageSize ? Number(search.pageSize) : 10,
    }),
    beforeLoad: ({ context, search }) => {
        const { page = 1, pageSize = 10 } = search;
        const auth = context.auth;

        // Prevent advertisers from accessing the magazine management page
        if (auth?.isAdvertiser) {
            throw new Error('Advertisers cannot access the magazine management page')
        }

        // Create query options that can be used by child routes and components
        const queryOptions = {
            queryKey: ['agent-properties-paginated', auth.user?.neg_id, page, pageSize],
            queryFn: () => fetchAgentPaginatedProperties(auth.user?.neg_id, { page, pageSize }),
            enabled: !!auth.user?.neg_id,
        };

        return {
            ...context,
            agentPropertiesQueryOptions: queryOptions,
        };
    },
    loader: async ({ context }) => {
        // Use the query options from context to preload data
        if (context.agentPropertiesQueryOptions && context.agentPropertiesQueryOptions.enabled) {
            return context.queryClient.ensureQueryData(context.agentPropertiesQueryOptions);
        }
        
        return null;
    },
    pendingComponent: () => (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700 font-medium">Loading...</span>
            </div>
        </div>
    ),
    component: () => {
        
        // Get agent ID from URL params or however you're passing it
        const auth = useAuth()
        const search = Route.useSearch()
        const navigate = Route.useNavigate()

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
            <AgentPaginatedEnhancedTable 
                agentId={auth.user.neg_id}
                page={search.page}
                pageSize={search.pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />
        )
    },
})