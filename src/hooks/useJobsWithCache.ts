import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { Job } from '@/types/job';
import { JobsService } from '@/logic/api';
import { useAppContext } from '@/components/filters/FilterContext';

interface PageData {
  jobs: Job[];
  page: number;
}

export const useJobsWithCache = () => {
  const { filters } = useAppContext();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    error,
    refetch,
  }: UseInfiniteQueryResult<InfiniteData<PageData>, unknown> = useInfiniteQuery({
    queryKey: ['jobs', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const jobs = await JobsService.fetchJobs(pageParam, 50);
      return { jobs, page: pageParam };
    },
    getNextPageParam: (lastPage: PageData) =>
      lastPage.jobs.length === 50 ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const jobs = data?.pages.flatMap((page: PageData) => page.jobs) || [];

  const loadMoreJobs = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  if (error) {
    console.error('Error en useJobsWithCache:', error);
  }

  return { jobs, loadMoreJobs, hasMore: hasNextPage, loading: isLoading || isFetching, error, refetch };
};