import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAdvertiserById } from '@/components/Magazine/api';
import { useAuth } from '@/components/Auth/Auth-context';
import { BLOG_POST_DATA_LIST } from '@/constants';

export const Route = createFileRoute('/_auth/_dashboard/advertiser/$id/blog-posts')({
  validateSearch: (search) => ({
    returnPage: search.returnPage ? Number(search.returnPage) : undefined,
    returnSearch: search.returnSearch || '',
  }),
  beforeLoad: ({ context, params }) => {
    const { id: advertiserId } = params;
    const auth = context.auth;

    // Permission check: admin or owns this advertiser_id
    const canView =
      auth.user?.is_admin ||
      (auth.isAdvertiser && `${auth.user?.advertiser_id}` === `${advertiserId}`);

    if (!canView) {
      throw redirect({ to: '/advertiser' });
    }

    return context;
  },
  component: function AdvertiserBlogPostsRoute() {
    const { id: advertiserId } = Route.useParams();
    const search = Route.useSearch();
    const navigate = useNavigate();
    const auth = useAuth();

    // Fetch advertiser details for admin to display name
    const { data: advertiserData } = useQuery({
      queryKey: ['advertiser', advertiserId],
      queryFn: () => fetchAdvertiserById(advertiserId),
      enabled: !!advertiserId && auth.user?.is_admin,
    });

    const advertiserName = advertiserData?.data?.company;

    const handleBack = () => {
      const returnParams = {};
      if (search.returnPage) returnParams.page = search.returnPage;
      if (search.returnSearch) returnParams.search = search.returnSearch;

      navigate({
        to: '/advertiser',
        search: Object.keys(returnParams).length > 0 ? returnParams : undefined,
      });
    };

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
              Back to Advertisers
            </Button>

            <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
            {auth.user?.is_admin && advertiserName && (
              <p className="text-sm text-gray-600 mt-1">{advertiserName}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {BLOG_POST_DATA_LIST.map((item) => (
              <Link
                key={item.id}
                to={`/advertiser/${advertiserId}/blog-posts/${item.id}`}
                className="flex flex-col items-start text-left px-8 py-6 rounded-3xl border-2 border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{item.title}</span>
                <span className="text-sm text-gray-500 mt-1">{item.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  },
});
