import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchAgencies } from '@/components/Stats/api';

const columnHelper = createColumnHelper();

/**
 * Searchable, paginated agency selection table
 */
const AgencySelectionTable = ({
  variant = 'stats',
  basePath,
  cleanSearchParams,
  DEFAULTS,
  navigationPrefix,
  urlSearch: externalUrlSearch // Accept search params from parent
}) => {
  const navigate = useNavigate();

  // Determine navigation target based on variant and navigationPrefix
  const navigationPath = navigationPrefix
    ? `${navigationPrefix}`
    : variant === 'stats'
      ? '/stats/agency'
      : '/booking-history/agency';

  const navigationSuffix = navigationPrefix
    ? variant === 'stats' ? '/stats' : '/bookings'
    : '';

  // Use external search params if provided, or fall back to DEFAULTS
  const urlSearch = externalUrlSearch || {
    tab: DEFAULTS.tab,
    page: DEFAULTS.page,
    limit: DEFAULTS.limit,
    search: DEFAULTS.search,
    sortBy: DEFAULTS.sortBy[DEFAULTS.tab],
    order: DEFAULTS.order,
  };

  // Only use this table's state if we're on the correct tab
  const isActive = urlSearch.tab === 'agencies' || urlSearch.tab === 'bookings' || urlSearch.tab === 'stats';

  // Local search input state
  const [searchInput, setSearchInput] = useState(urlSearch.search || '');

  // Sync local search input with URL when tab becomes active
  useEffect(() => {
    if (isActive) {
      setSearchInput(urlSearch.search || '');
    }
  }, [isActive, urlSearch.search]);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update URL when debounced search changes
  useEffect(() => {
    if (isActive && debouncedSearch !== urlSearch.search) {
      const params = cleanSearchParams({
        ...urlSearch,
        search: debouncedSearch,
        page: 1,
      }, urlSearch.tab);

      navigate({
        to: basePath,
        search: params,
        replace: true,
      });
    }
  }, [debouncedSearch, isActive, navigate, urlSearch, cleanSearchParams, basePath]);

  // Fetch agencies with TanStack Query
  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['agencies-list', urlSearch.page, urlSearch.limit, urlSearch.search],
    queryFn: () => fetchAgencies({
      page: urlSearch.page,
      limit: urlSearch.limit,
      search: urlSearch.search
    }),
    placeholderData: keepPreviousData,
    enabled: isActive,
  });

  const agencies = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  };

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('cid', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('name', {
        header: 'Agency Name',
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: (info) => info.getValue() || '-',
      }),
    ],
    []
  );

  const table = useReactTable({
    data: agencies,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle row click
  const handleRowClick = (agency) => {
    navigate({ to: `${navigationPath}/${agency.cid}${navigationSuffix}` });
  };

  // Handle page change
  const handlePrevPage = () => {
    const newPage = Math.max(1, urlSearch.page - 1);
    const params = cleanSearchParams({
      ...urlSearch,
      page: newPage,
    }, urlSearch.tab);

    navigate({
      to: basePath,
      search: params,
      replace: true,
    });
  };

  const handleNextPage = () => {
    if (!isPlaceholderData && pagination.has_next) {
      const params = cleanSearchParams({
        ...urlSearch,
        page: urlSearch.page + 1,
      }, urlSearch.tab);

      navigate({
        to: basePath,
        search: params,
        replace: true,
      });
    }
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading agencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search agencies by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading Overlay */}
      <div className="relative">
        {isFetching && isPlaceholderData && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-700 font-medium">Loading...</span>
            </div>
          </div>
        )}

        {/* Table */}
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
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <p className="font-medium">No agencies found</p>
                      {urlSearch.search && (
                        <p className="text-sm mt-1">Try a different search term</p>
                      )}
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

      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(urlSearch.page - 1) * urlSearch.limit + 1} to{' '}
            {Math.min(urlSearch.page * urlSearch.limit, pagination.total)} of {pagination.total} agencies
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!pagination.has_prev || isFetching}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {urlSearch.page} of {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.has_next || isPlaceholderData || isFetching}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencySelectionTable;
