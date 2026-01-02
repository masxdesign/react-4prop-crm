import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Search, Loader2, UserSearch } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchAgentsForSelection } from '../api';

const columnHelper = createColumnHelper();

// Default values for standalone mode
const STANDALONE_DEFAULTS = {
  search: '',
  limit: 20,
  page: 1,
  sortBy: 'surname',
  order: 'asc',
};

// Remove default values from search params to keep URLs clean
const standaloneCleanSearchParams = (params) => {
  const cleaned = {};
  if (params.search && params.search !== STANDALONE_DEFAULTS.search) cleaned.search = params.search;
  if (params.limit && params.limit !== STANDALONE_DEFAULTS.limit) cleaned.limit = params.limit;
  if (params.page && params.page !== STANDALONE_DEFAULTS.page) cleaned.page = params.page;
  if (params.sortBy && params.sortBy !== STANDALONE_DEFAULTS.sortBy) cleaned.sortBy = params.sortBy;
  if (params.order && params.order !== STANDALONE_DEFAULTS.order) cleaned.order = params.order;
  return cleaned;
};

/**
 * Agent search/selection table. Works standalone or embedded in AgencyHub.
 */
const AgentSelectionTable = ({
  basePath,
  cleanSearchParams: externalCleanSearchParams,
  DEFAULTS: externalDefaults,
  navigationPrefix,
  embedded = false,
  urlSearch: externalUrlSearch // Accept search params from parent
}) => {
  // Use standalone or external config
  const isStandalone = !embedded;
  const defaults = externalDefaults || STANDALONE_DEFAULTS;
  const cleanFn = externalCleanSearchParams || standaloneCleanSearchParams;
  const routePath = basePath || '/mag/agent/select';
  const searchFrom = isStandalone ? '/_auth/_dashboard/mag/agent/select' : undefined;
  const navTarget = navigationPrefix || '/mag/agent';

  const navigate = useNavigate({ from: routePath });
  // Only use internal useSearch for standalone mode
  const rawUrlSearch = isStandalone ? useSearch({ from: searchFrom }) : {};

  // Use external search params if provided, or fall back to internal search
  const urlSearch = externalUrlSearch || {
    tab: rawUrlSearch.tab || defaults.tab,
    search: rawUrlSearch.search || defaults.search || '',
    limit: rawUrlSearch.limit || defaults.limit || 20,
    page: rawUrlSearch.page || defaults.page || 1,
    sortBy: rawUrlSearch.sortBy || (defaults.sortBy?.agents || defaults.sortBy || 'surname'),
    order: rawUrlSearch.order || defaults.order || 'asc',
  };

  // Check if this tab is active (for embedded mode)
  const isActive = isStandalone || urlSearch.tab === 'agents';

  // Local search input state
  const [searchInput, setSearchInput] = useState(urlSearch.search);

  // Sync local search input with URL
  useEffect(() => {
    if (isActive) {
      setSearchInput(urlSearch.search);
    }
  }, [isActive, urlSearch.search]);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update URL when debounced search changes
  useEffect(() => {
    if (isActive && debouncedSearch !== urlSearch.search) {
      const params = cleanFn({
        ...urlSearch,
        search: debouncedSearch,
        page: 1,
      }, urlSearch.tab);

      navigate({ search: params, replace: true });
    }
  }, [debouncedSearch, isActive, navigate, urlSearch, cleanFn]);

  // Fetch agents (only if search >= 2 chars and tab is active)
  const shouldFetch = isActive && debouncedSearch.length >= 2;
  const { data, isFetching } = useQuery({
    queryKey: ['agents-selection', debouncedSearch, urlSearch.limit, urlSearch.page, urlSearch.sortBy, urlSearch.order],
    queryFn: () => fetchAgentsForSelection({
      search: debouncedSearch,
      limit: urlSearch.limit,
      page: urlSearch.page,
      sortBy: urlSearch.sortBy,
      order: urlSearch.order,
    }),
    enabled: shouldFetch,
  });

  const agents = data?.data || [];

  // Table columns
  const columns = useMemo(() => [
    columnHelper.accessor('nid', {
      header: 'NID',
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => `${row.firstname} ${row.surname}`, {
      id: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('company', {
      header: 'Company',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('position', {
      header: 'Position',
      cell: (info) => info.getValue() || '-',
    }),
  ], []);

  const table = useReactTable({
    data: agents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (agent) => {
    navigate({ to: `${navTarget}/${agent.nid}` });
  };

  // Content to render
  const content = (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, email, or company (minimum 2 characters)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Info */}
      {searchInput.length > 0 && searchInput.length < 2 && (
        <p className="text-sm text-gray-500">Please enter at least 2 characters to search</p>
      )}

      {shouldFetch && (
        <p className="text-sm text-gray-500">
          {isFetching ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </span>
          ) : (
            <span>
              Found {agents.length} agent{agents.length !== 1 ? 's' : ''}{' '}
              {agents.length === urlSearch.limit && `(limited to ${urlSearch.limit} results)`}
            </span>
          )}
        </p>
      )}

      {/* Table */}
      {shouldFetch && (
        <div className="relative">
          {isFetching && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-700 font-medium">Searching...</span>
              </div>
            </div>
          )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <UserSearch className="h-12 w-12 mb-3 text-gray-400" />
                        <p className="font-medium">No agents found</p>
                        <p className="text-sm mt-1">Try a different search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!shouldFetch && searchInput.length < 2 && (
        <div className="border rounded-lg p-12">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <UserSearch className="h-16 w-16 mb-4 text-gray-400" />
            <p className="font-medium text-lg">Search for an agent</p>
            <p className="text-sm mt-2">Enter a name, email, or company to find agents</p>
          </div>
        </div>
      )}
    </div>
  );

  // Standalone mode: wrap in full page layout
  if (isStandalone) {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">View Agent Properties</h1>
            <p className="text-gray-600 mt-1">Search for an agent by name, email, or company to view their department properties</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Search Agents</CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Embedded mode: just the content
  return content;
};

export default AgentSelectionTable;
