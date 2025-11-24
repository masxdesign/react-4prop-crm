import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
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
import { fetchAdvertisers } from '@/components/Stats/api';

const columnHelper = createColumnHelper();

/**
 * Searchable, paginated advertiser selection table
 * @param {string} variant - 'stats' | 'booking-history'
 * @param {string} basePath - Route path for navigation
 * @param {Function} cleanSearchParams - Clean search params utility
 * @param {Object} DEFAULTS - Default search param values
 */
const AdvertiserSelectionTable = ({ variant = 'stats', basePath, cleanSearchParams, DEFAULTS }) => {
  const navigate = useNavigate({ from: basePath });
  const rawUrlSearch = useSearch({ from: basePath.replace('/crm', '/_auth/_dashboard') });

  // Determine navigation target based on variant
  const navigationPath = variant === 'stats'
    ? '/crm/stats/advertiser'
    : '/crm/booking-history/advertiser';

  // Apply defaults to URL search params
  const urlSearch = {
    tab: rawUrlSearch.tab || DEFAULTS.tab,
    page: rawUrlSearch.page || DEFAULTS.page,
    limit: rawUrlSearch.limit || DEFAULTS.limit,
    search: rawUrlSearch.search || DEFAULTS.search,
    sortBy: rawUrlSearch.sortBy || DEFAULTS.sortBy[rawUrlSearch.tab || DEFAULTS.tab],
    order: rawUrlSearch.order || DEFAULTS.order,
  };

  // Only use this table's state if we're on the advertisers tab
  const isActive = urlSearch.tab === 'advertisers';

  // Local search input state (not debounced)
  const [searchInput, setSearchInput] = useState(urlSearch.search || '');

  // Sync local search input with URL when tab becomes active
  useEffect(() => {
    if (isActive) {
      setSearchInput(urlSearch.search || '');
    }
  }, [isActive, urlSearch.search]);

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update URL when debounced search changes
  useEffect(() => {
    if (isActive && debouncedSearch !== urlSearch.search) {
      const params = cleanSearchParams({
        ...urlSearch,
        search: debouncedSearch,
        page: 1, // Reset to first page on search
      }, urlSearch.tab);

      navigate({
        search: params,
        replace: true,
      });
    }
  }, [debouncedSearch, isActive, navigate, urlSearch, cleanSearchParams]);

  // Fetch advertisers with TanStack Query (only when this tab is active)
  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['advertisers-list', urlSearch.page, urlSearch.limit, urlSearch.search],
    queryFn: () => fetchAdvertisers({
      page: urlSearch.page,
      limit: urlSearch.limit,
      search: urlSearch.search
    }),
    placeholderData: keepPreviousData,
    enabled: isActive, // Only fetch when this tab is active
  });

  const advertisers = data?.data || [];
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
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('company', {
        header: 'Company Name',
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('week_rate', {
        header: 'Week Rate',
        cell: (info) => {
          const value = info.getValue();
          return value ? `£${parseFloat(value).toFixed(2)}` : '-';
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: advertisers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle row click - navigate to advertiser detail page
  const handleRowClick = (advertiser) => {
    navigate({ to: `${navigationPath}/${advertiser.id}` });
  };

  // Handle page change - update URL
  const handlePrevPage = () => {
    const newPage = Math.max(1, urlSearch.page - 1);
    const params = cleanSearchParams({
      ...urlSearch,
      page: newPage,
    }, urlSearch.tab);

    navigate({
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
          <p className="text-gray-600">Loading advertisers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search advertisers by company name..."
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
                      <p className="font-medium">No advertisers found</p>
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
            {Math.min(urlSearch.page * urlSearch.limit, pagination.total)} of {pagination.total} advertisers
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

export default AdvertiserSelectionTable;
