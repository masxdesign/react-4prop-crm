import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/components/Auth/Auth";
import AgentPaginatedEnhancedTable from "@/components/Magazine/AgentPropertiesTable/AgentPaginatedEnhancedTable";
import { fetchAgentPaginatedProperties } from "@/components/Magazine/api";

export const Route = createFileRoute("/_auth/_dashboard/mag/agent/$nid")({
  validateSearch: (search) => ({
    page: search.page ? Number(search.page) : 1,
    pageSize: search.pageSize ? Number(search.pageSize) : 10,
  }),
  beforeLoad: ({ context, params, search }) => {
    const { nid } = params;
    const { page = 1, pageSize = 10 } = search;
    const auth = context.auth;

    // Only super admins can access this route
    if (!auth.user?.is_admin) {
      throw redirect({ to: '/crm/mag' });
    }

    // Validate nid parameter
    if (!nid) {
      throw new Error('Agent NID is required');
    }

    // Create query options for the specified agent
    const queryOptions = {
      queryKey: ['agent-properties-paginated', nid, page, pageSize],
      queryFn: () => fetchAgentPaginatedProperties(nid, { page, pageSize }),
      enabled: !!nid,
    };

    return {
      ...context,
      agentPropertiesQueryOptions: queryOptions,
      viewingNid: nid, // Track which agent we're viewing
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
        <span className="text-gray-700 font-medium">Loading agent properties...</span>
      </div>
    </div>
  ),
  component: () => {
    const auth = useAuth();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const { nid } = Route.useParams();

    // Pagination handlers
    const onPageChange = (page) => {
      navigate({ search: { ...search, page } });
    };

    const onPageSizeChange = (pageSize) => {
      navigate({ search: { ...search, pageSize, page: 1 } });
    };

    if (!nid) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Agent ID
            </h2>
            <p className="text-gray-600">Agent NID is required.</p>
          </div>
        </div>
      );
    }

    // Check if admin is viewing another agent (not themselves)
    const isViewingOtherAgent = auth.user?.neg_id !== nid;

    return (
      <AgentPaginatedEnhancedTable
        agentId={nid}
        page={search.page}
        pageSize={search.pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isAdminViewing={isViewingOtherAgent}
        adminNid={auth.user?.neg_id}
        viewingAgentNid={nid}
      />
    );
  },
});
