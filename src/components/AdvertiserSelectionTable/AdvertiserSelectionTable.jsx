import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Search, Loader2, ChevronLeft, ChevronRight, Calendar, BarChart3, Pencil, Trash2, MoreHorizontal, FileText, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { fetchAdvertisers } from '@/components/Stats/api';
import { updateAdvertiser, deleteAdvertiser, getAdvertiserStripeStatus } from '@/components/Magazine/api';
import AdvertiserForm from '@/components/Magazine/AdvertiserManagement/AdvertiserForm';
import AdvertiserOnboarding from '@/components/Magazine/stripe/AdvertiserOnboarding';
import usePropertySubtypes from '@/hooks/usePropertySubtypes';
import { toast } from '@/components/ui/use-toast';

const columnHelper = createColumnHelper();

// Stripe Status Cell Component - fetches status per advertiser
const StripeStatusCell = ({ advertiserId, advertiserName, onSetupClick }) => {
  const { data: stripeStatusData, isLoading } = useQuery({
    queryKey: ['advertiser-stripe-status', advertiserId],
    queryFn: () => getAdvertiserStripeStatus(advertiserId),
    refetchInterval: false,
  });

  const stripeStatus = stripeStatusData?.data;
  const isOnboarded = stripeStatus?.onboarding_completed;

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }

  if (isOnboarded) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle className="h-3 w-3" />
        <span>Connected</span>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSetupClick(advertiserId, advertiserName);
      }}
      className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 underline"
    >
      <AlertCircle className="h-3 w-3" />
      <span>Setup Stripe</span>
    </button>
  );
};

/**
 * Searchable, paginated advertiser selection table
 *
 * @param {boolean} showActionButtons - When true, shows Bookings/Stats buttons instead of row click
 */
const AdvertiserSelectionTable = ({
  variant = 'stats',
  basePath,
  cleanSearchParams,
  DEFAULTS,
  navigationPrefix,
  urlSearch: externalUrlSearch, // Accept search params from parent
  showActionButtons = false, // Show action buttons instead of row click
  showManageButtons = false, // Show Edit/Delete buttons
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getSubtypeLabels } = usePropertySubtypes();

  // Edit/Delete state
  const [editingAdvertiser, setEditingAdvertiser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [advertiserToDelete, setAdvertiserToDelete] = useState(null);

  // Stripe onboarding state
  const [stripeOnboardingOpen, setStripeOnboardingOpen] = useState(false);
  const [stripeOnboardingAdvertiser, setStripeOnboardingAdvertiser] = useState(null);

  // Handle copy email
  const handleCopyEmail = (email, e) => {
    e.stopPropagation();
    if (email) {
      navigator.clipboard.writeText(email);
      toast({
        title: 'Email copied',
        description: 'Email address copied to clipboard',
        duration: 2000,
      });
    }
  };

  // Handle Stripe setup click
  const handleStripeSetup = (advertiserId, advertiserName) => {
    setStripeOnboardingAdvertiser({ id: advertiserId, name: advertiserName });
    setStripeOnboardingOpen(true);
  };

  // Update advertiser mutation
  const updateMutation = useMutation({
    mutationFn: updateAdvertiser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisers-list'] });
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });
      setEditingAdvertiser(null);
      setIsFormOpen(false);
    },
  });

  // Delete advertiser mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAdvertiser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisers-list'] });
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });
      setDeleteConfirmOpen(false);
      setAdvertiserToDelete(null);
    },
  });

  // Determine navigation target based on variant and navigationPrefix
  const navigationPath = navigationPrefix
    ? `${navigationPrefix}`
    : variant === 'stats'
      ? '/stats/advertiser'
      : '/booking-history/advertiser';

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

  // Only use this table's state if we're on the correct tab (or no tab system is used)
  const isActive = !urlSearch.tab || urlSearch.tab === 'advertisers' || urlSearch.tab === 'bookings' || urlSearch.tab === 'stats' || urlSearch.tab === 'manage';

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

  // Fetch advertisers with TanStack Query
  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['advertisers-list', urlSearch.page, urlSearch.limit, urlSearch.search],
    queryFn: () => fetchAdvertisers({
      page: urlSearch.page,
      limit: urlSearch.limit,
      search: urlSearch.search
    }),
    placeholderData: keepPreviousData,
    enabled: isActive,
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
    () => {
      const baseColumns = [
        columnHelper.accessor('company', {
          header: 'Advertiser',
          cell: (info) => (
            <div className="flex flex-col">
              <button
                onClick={(e) => handleEditClick(info.row.original, e)}
                className="font-semibold text-base text-gray-900 hover:underline text-left cursor-pointer"
              >
                {info.getValue()}
              </button>
              {info.row.original.email ? (
                <button
                  onClick={(e) => handleCopyEmail(info.row.original.email, e)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 group text-left"
                  title="Click to copy email"
                >
                  <span className="truncate max-w-[200px]">{info.row.original.email}</span>
                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ) : (
                <span className="text-sm text-gray-400 italic">No email</span>
              )}
            </div>
          ),
        }),
        columnHelper.display({
          id: 'stripe_status',
          header: 'Stripe Status',
          cell: ({ row }) => (
            <StripeStatusCell
              advertiserId={row.original.id}
              advertiserName={row.original.company}
              onSetupClick={handleStripeSetup}
            />
          ),
        }),
        columnHelper.accessor('week_rate', {
          header: 'Week Rate',
          cell: (info) => {
            const value = info.getValue();
            return value ? `£${parseFloat(value).toFixed(2)}` : '-';
          },
        }),
        columnHelper.accessor('commission_percent', {
          header: 'Commission',
          cell: (info) => {
            const value = info.getValue();
            return value != null ? `${value}%` : '-';
          },
        }),
        columnHelper.accessor('pstids', {
          header: 'Subtypes',
          cell: (info) => {
            const value = info.getValue();
            if (!value) return <span className="text-xs text-gray-400">All types</span>;
            const labels = getSubtypeLabels(value);
            if (labels.length === 0) return <span className="text-xs text-gray-400">All types</span>;
            const displayLabels = labels.slice(0, 3);
            const remaining = labels.length - 3;
            return (
              <div className="flex flex-wrap gap-1 max-w-[180px]">
                {displayLabels.map((label, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {label}
                  </span>
                ))}
                {remaining > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-500">
                    +{remaining}
                  </span>
                )}
              </div>
            );
          },
        }),
      ];

      // Add action buttons column when showActionButtons or showManageButtons is true
      if (showActionButtons || showManageButtons) {
        baseColumns.push(
          columnHelper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                {showActionButtons && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="gradient"
                          size="icon"
                          onClick={(e) => handleBlogPostsClick(row.original, e)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Blog Posts</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="gradient"
                          size="icon"
                          onClick={(e) => handleBookingsClick(row.original, e)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bookings</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="gradient"
                          size="icon"
                          onClick={(e) => handleStatsClick(row.original, e)}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Stats</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {showManageButtons && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="gradient-silver"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleEditClick(row.original, e)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(row.original, e)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ),
          })
        );
      }

      return baseColumns;
    },
    [showActionButtons, showManageButtons, getSubtypeLabels, handleCopyEmail, handleStripeSetup]
  );

  const table = useReactTable({
    data: advertisers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Build return search params for back button navigation
  const getReturnSearchParams = () => {
    const searchParams = {};
    if (urlSearch.page && urlSearch.page !== 1) {
      searchParams.returnPage = urlSearch.page;
    }
    if (urlSearch.search) {
      searchParams.returnSearch = urlSearch.search;
    }
    return searchParams;
  };

  // Handle row click (only used when showActionButtons is false)
  const handleRowClick = (advertiser) => {
    navigate({ to: `${navigationPath}/${advertiser.id}${navigationSuffix}`, search: getReturnSearchParams() });
  };

  // Handle action button clicks
  const handleBookingsClick = (advertiser, e) => {
    e.stopPropagation();
    navigate({ to: `${navigationPrefix || '/advertiser'}/${advertiser.id}/bookings`, search: getReturnSearchParams() });
  };

  const handleStatsClick = (advertiser, e) => {
    e.stopPropagation();
    navigate({ to: `${navigationPrefix || '/advertiser'}/${advertiser.id}/stats`, search: getReturnSearchParams() });
  };

  const handleBlogPostsClick = (advertiser, e) => {
    e.stopPropagation();
    navigate({ to: `${navigationPrefix || '/advertiser'}/${advertiser.id}/blog-posts`, search: getReturnSearchParams() });
  };

  // Handle Edit button click
  const handleEditClick = (advertiser, e) => {
    e.stopPropagation();
    setEditingAdvertiser(advertiser);
    setIsFormOpen(true);
  };

  // Handle Delete button click
  const handleDeleteClick = (advertiser, e) => {
    e.stopPropagation();
    setAdvertiserToDelete(advertiser);
    setDeleteConfirmOpen(true);
  };

  // Handle form submission for edit
  const handleFormSubmit = (data) => {
    if (editingAdvertiser) {
      // For editing mode: only send changed fields
      const changedData = {};

      // Check each field for changes
      Object.keys(data).forEach((key) => {
        if (data[key] !== editingAdvertiser[key]) {
          changedData[key] = data[key];
        }
      });

      // Always include password if provided (it won't be in editingAdvertiser)
      if (data.password) {
        changedData.password = data.password;
      }

      // Only send update if there are changes
      if (Object.keys(changedData).length > 0) {
        updateMutation.mutate({ id: editingAdvertiser.id, ...changedData });
      } else {
        // No changes, just close the form
        setEditingAdvertiser(null);
        setIsFormOpen(false);
      }
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (advertiserToDelete) {
      deleteMutation.mutate(advertiserToDelete.id);
    }
  };

  // Close form handler
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAdvertiser(null);
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
          <p className="text-gray-600">Loading advertisers...</p>
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
        <div className="border rounded-lg overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
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
                    className={(showActionButtons || showManageButtons) ? "hover:bg-muted/50 transition-colors" : "hover:bg-muted/50 cursor-pointer transition-colors"}
                    onClick={(showActionButtons || showManageButtons) ? undefined : () => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap py-3">
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

      {/* Edit Advertiser Form Dialog */}
      {showManageButtons && (
        <AdvertiserForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          advertiser={editingAdvertiser}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
          isLoading={updateMutation.isPending}
          error={updateMutation.error}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showManageButtons && (
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Advertiser</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{advertiserToDelete?.company}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Stripe Onboarding Dialog */}
      <Dialog open={stripeOnboardingOpen} onOpenChange={setStripeOnboardingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stripe Onboarding</DialogTitle>
            <DialogDescription>
              Connect {stripeOnboardingAdvertiser?.name} to Stripe to receive payments.
            </DialogDescription>
          </DialogHeader>
          {stripeOnboardingAdvertiser && (
            <AdvertiserOnboarding
              advertiserId={stripeOnboardingAdvertiser.id}
              advertiserName={stripeOnboardingAdvertiser.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertiserSelectionTable;
