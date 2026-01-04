import { useState, useMemo } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2, MapPin, Building2, Bot, ShoppingBag, X, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirtualizedTree from '@/components/ui-custom/VirtualizedTree';
import { fetchAdvertiserById, fetchPostcodesTreeFull } from '@/components/Magazine/api';
import { useAuth } from '@/components/Auth/Auth-context';
import { BLOG_POST_DATA_LIST } from '@/constants';
import { useStreetPostJobs, useCreateStreetPostJobMutation, useCancelJobMutation } from '@/features/jobs/jobs.hooks';

// Job status configuration
const JOB_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  running: {
    label: 'Running',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Loader2,
    spin: true,
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Ban,
  },
};

// Format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// Custom icon renderer based on depth
const getTreeIcon = (_item, depth) => {
  if (depth === 0) return <MapPin className="h-4 w-4 text-blue-500" />;
  if (depth === 1) return <Building2 className="h-4 w-4 text-emerald-500" />;
  if (depth === 2) return <Bot className="h-4 w-4 text-purple-500" />;
  return <ShoppingBag className="h-4 w-4 text-amber-500" />;
};

export const Route = createFileRoute('/_auth/_dashboard/advertiser/$id/blog-posts_/$dataId')({
  beforeLoad: ({ context, params }) => {
    const { id: advertiserId } = params;
    const auth = context.auth;

    const canView =
      auth.user?.is_admin ||
      (auth.isAdvertiser && `${auth.user?.advertiser_id}` === `${advertiserId}`);

    if (!canView) {
      throw redirect({ to: '/advertiser' });
    }

    return context;
  },
  component: function BlogPostDataRoute() {
    const { id: advertiserId, dataId } = Route.useParams();
    const navigate = useNavigate();
    const auth = useAuth();
    const [selectedItems, setSelectedItems] = useState([]);

    // Derive selectedIds Set from selectedItems for controlled tree selection
    const selectedIds = useMemo(
      () => new Set(selectedItems.map((item) => item.id)),
      [selectedItems]
    );

    // Find the data list config by id
    const dataConfig = BLOG_POST_DATA_LIST.find((item) => item.id === Number(dataId));

    // Fetch advertiser details for admin to display name
    const { data: advertiserData } = useQuery({
      queryKey: ['advertiser', advertiserId],
      queryFn: () => fetchAdvertiserById(advertiserId),
      enabled: !!advertiserId && auth.user?.is_admin,
    });

    // Fetch full postcodes tree using the list from config
    const { data: treeData, isLoading, error } = useQuery({
      queryKey: ['postcodes-tree-full', dataConfig?.list],
      queryFn: () => fetchPostcodesTreeFull(dataConfig?.list),
      enabled: !!dataConfig?.list,
    });

    const advertiserName = advertiserData?.data?.company;

    const handleBack = () => {
      navigate({ to: `/advertiser/${advertiserId}/blog-posts` });
    };

    const handleSelectionChange = (items) => {
      console.log('Selected items:', items);
      setSelectedItems(items);
    };

    const handleRemoveItem = (itemId) => {
      setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    // Jobs hooks
    const { data: jobsData } = useStreetPostJobs(advertiserId);
    const createJobMutation = useCreateStreetPostJobMutation();
    const cancelJobMutation = useCancelJobMutation();

    const handleGenerate = async (e) => {
      e.preventDefault();

      // Process each selected item
      for (const item of selectedItems) {
        // Item ancestry: [root, prefix, district, street]
        // item.ancestry[1].name = postcode prefix (e.g., "E1")
        // item.name = street with count (e.g., "Brick Lane (42)")

        const postcode = item.ancestry?.[1]?.name || '';

        // Extract street name: "Brick Lane (42)" -> "Brick Lane"
        const streetWithCount = item.name;
        const street = streetWithCount.replace(/\s*\(\d+\)$/, '');

        await createJobMutation.mutateAsync({
          postcode,
          street,
          advertiserId: Number(advertiserId),
          createdBy: auth.user?.id
        });
      }

      // Clear selection after successful submission
      setSelectedItems([]);
    };

    const handleCancelJob = (jobId) => {
      cancelJobMutation.mutate(jobId);
    };

    if (!dataConfig) {
      return (
        <div className="flex flex-col h-full overflow-auto">
          <div className="flex-1 p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="self-start -ml-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Blog Posts
            </Button>
            <p className="text-gray-600">Data list not found.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="self-start -ml-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Blog Posts
            </Button>

            <h1 className="text-3xl font-bold text-gray-900">{dataConfig.title}</h1>
            {auth.user?.is_admin && advertiserName && (
              <p className="text-sm text-gray-600 mt-1">{advertiserName}</p>
            )}
            <p className="text-gray-500 mt-2">{dataConfig.description}</p>
          </div>

          {/* Stats */}
          {treeData?.data && (
            <p className="text-sm text-gray-500">
              {treeData.totalPrefixes} areas, {treeData.totalDistricts} districts, {treeData.totalSources} sources
            </p>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading postcodes...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <p className="text-red-600">Failed to load postcodes: {error.message}</p>
          )}

          {/* Main content: Tree + Selection tray */}
          {treeData?.data && (
            <div className="flex gap-6">
              {/* Left: Tree view */}
              <div className="w-96 flex-shrink-0">
                <VirtualizedTree
                  data={treeData.data}
                  getIcon={getTreeIcon}
                  searchPlaceholder="Find street"
                  showExpandAll={true}
                  autoExpandMatch={(item) => item.name === 'claude'}
                  selectableDepths={[1, 2, 3]}
                  defaultChildMatcher={(child) => child.name === 'claude'}
                  selectionColor="bg-blue-100"
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                />
              </div>

              {/* Right: Selection tray + Jobs list */}
              <div className="flex-1 flex flex-col">
                {/* Selection tray as form */}
                <form onSubmit={handleGenerate}>
                  <div className="border-2 border-gray-300 rounded-xl bg-white flex flex-col min-h-[120px]">
                    {/* Tray header with Generate button */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <span className="text-sm text-gray-500">
                        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                      </span>
                      <Button
                        type="submit"
                        variant="gradient"
                        disabled={selectedItems.length === 0 || createJobMutation.isPending}
                      >
                        {createJobMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Generate
                      </Button>
                    </div>

                    {/* Pills container */}
                    <div className="flex-1 p-4 overflow-auto">
                      {selectedItems.length === 0 ? (
                        <p className="text-gray-400 text-sm">
                          Select items from the tree to add them here
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedItems.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {/* Show ancestry path */}
                              {item.ancestry?.slice(1).map((a) => a.name).join(' → ')}
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </form>

                {/* Jobs List Section */}
                <div className="border-2 border-gray-300 rounded-xl bg-white mt-6">
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="text-sm text-gray-500">
                      {jobsData?.count || 0} street post job{jobsData?.count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 max-h-[300px] overflow-auto">
                    {!jobsData?.jobs?.length ? (
                      <p className="text-gray-400 text-sm">No jobs yet</p>
                    ) : (
                      jobsData.jobs.map((job) => {
                        const statusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.pending;
                        const StatusIcon = statusConfig.icon;
                        const canCancel = job.status === 'pending' || job.status === 'running';

                        return (
                          <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                                  <StatusIcon className={`h-3 w-3 ${statusConfig.spin ? 'animate-spin' : ''}`} />
                                  {statusConfig.label}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {job.input_data?.postcode} - {job.input_data?.street}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Created {formatRelativeTime(job.created_at)}
                                {job.completed_at && ` • Completed ${formatRelativeTime(job.completed_at)}`}
                              </div>
                              {job.status === 'failed' && job.error_message && (
                                <p className="text-xs text-red-600 mt-1">{job.error_message}</p>
                              )}
                            </div>
                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => handleCancelJob(job.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Cancel job"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});
