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

// Default values for search params
const DEFAULTS = {
  search: '',
  limit: 20,
  page: 1,
  sortBy: 'surname',
  order: 'asc',
};

/**
 * Remove default values from search params to keep URLs clean
 */
const cleanSearchParams = (params) => {
  const cleaned = {};

  // Only add search if it's not empty
  if (params.search && params.search !== DEFAULTS.search) {
    cleaned.search = params.search;
  }

  // Only add limit if it's not the default
  if (params.limit && params.limit !== DEFAULTS.limit) {
    cleaned.limit = params.limit;
  }

  // Only add page if it's not the default
  if (params.page && params.page !== DEFAULTS.page) {
    cleaned.page = params.page;
  }

  // Only add sortBy if it's not the default
  if (params.sortBy && params.sortBy !== DEFAULTS.sortBy) {
    cleaned.sortBy = params.sortBy;
  }

  // Only add order if it's not the default
  if (params.order && params.order !== DEFAULTS.order) {
    cleaned.order = params.order;
  }

  return cleaned;
};

/**
 * AgentSelectionTable Component
 *
 * Admin-only component for searching and selecting agents by name, email, or company.
 * Allows super admins to view any agent's department properties.
 * Uses debounced search with minimum 2 characters required.
 * Supports pagination and sorting via URL parameters.
 */
const AgentSelectionTable = () => {
  const navigate = useNavigate({ from: '/mag/agent/select' });
  const rawUrlSearch = useSearch({ from: '/_auth/_dashboard/mag/agent/select' });

  // Apply defaults to URL search params
  const urlSearch = {
    search: rawUrlSearch.search || DEFAULTS.search,
    limit: rawUrlSearch.limit || DEFAULTS.limit,
    page: rawUrlSearch.page || DEFAULTS.page,
    sortBy: rawUrlSearch.sortBy || DEFAULTS.sortBy,
    order: rawUrlSearch.order || DEFAULTS.order,
  };

  // Local search input state (not debounced)
  const [searchInput, setSearchInput] = useState(urlSearch.search);

  // Sync local search input with URL on mount
  useEffect(() => {
    setSearchInput(urlSearch.search);
  }, [urlSearch.search]);

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== urlSearch.search) {
      const params = cleanSearchParams({
        search: debouncedSearch,
        limit: urlSearch.limit,
        page: DEFAULTS.page, // Reset to page 1 when search changes
        sortBy: urlSearch.sortBy,
        order: urlSearch.order,
      });

      navigate({
        search: params,
        replace: true,
      });
    }
  }, [debouncedSearch, navigate, urlSearch.limit, urlSearch.search, urlSearch.sortBy, urlSearch.order]);

  // Fetch agents with TanStack Query (only if search term is >= 2 chars)
  const shouldFetch = debouncedSearch.length >= 2;
  const { data, isLoading, isFetching } = useQuery({
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
  const pagination = data?.pagination || null;

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('nid', {
        header: 'NID',
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
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
    ],
    []
  );

  const table = useReactTable({
    data: agents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle row click - navigate to agent's properties page
  const handleRowClick = (agent) => {
    navigate({ to: `/mag/agent/${agent.nid}` });
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">View Agent Properties</h1>
          <p className="text-gray-600 mt-1">Search for an agent by name, email, or company to view their department properties</p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>Search Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <p className="text-sm text-gray-500">
                Please enter at least 2 characters to search
              </p>
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
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentSelectionTable;
