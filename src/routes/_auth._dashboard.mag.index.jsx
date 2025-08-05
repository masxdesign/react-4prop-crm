import React, { useState } from "react"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { useAuth } from "@/components/Auth/Auth"
import AgentPropertiesTable from "@/components/Magazine/AgentPropertiesTable/AgentPropertiesTable"

export const Route = createFileRoute("/_auth/_dashboard/mag/")({
    component: () => {
        // Get agent ID from URL params or however you're passing it
        const auth = useAuth()

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
            <AgentPropertiesTable agentId={auth.user.neg_id} />
        )
    },
})