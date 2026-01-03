import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2, MapPin, Building2, Bot, ShoppingBag } from 'lucide-react';
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

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading postcodes...</span>
            </div>
          )}

          {error && (
            <p className="text-red-600">Failed to load postcodes: {error.message}</p>
          )}

          {treeData?.data && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {treeData.totalPrefixes} areas, {treeData.totalDistricts} districts, {treeData.totalSources} sources
              </p>

              <VirtualizedTree
                data={treeData.data}
                getIcon={getTreeIcon}
                searchPlaceholder="Search streets..."
                showExpandAll={true}
                autoExpandMatch={(item) => item.name === 'claude'}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
});
