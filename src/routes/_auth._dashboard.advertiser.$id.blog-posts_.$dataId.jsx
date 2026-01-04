import { useState, useMemo } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2, MapPin, Building2, Bot, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirtualizedTree from '@/components/ui-custom/VirtualizedTree';
import { fetchAdvertiserById, fetchPostcodesTreeFull } from '@/components/Magazine/api';
import { useAuth } from '@/components/Auth/Auth-context';
import { BLOG_POST_DATA_LIST } from '@/constants';

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

    const handleGenerate = () => {
      console.log('Generate blog posts for:', selectedItems);
      // TODO: Implement generation logic
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

              {/* Right: Selection tray */}
              <div className="flex-1 flex flex-col">
                <div className="border-2 border-gray-300 rounded-xl bg-white flex flex-col min-h-[120px]">
                  {/* Tray header with Generate button */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="text-sm text-gray-500">
                      {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="gradient"
                      disabled={selectedItems.length === 0}
                      onClick={handleGenerate}
                    >
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
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});
