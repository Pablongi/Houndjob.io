import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { supabase } from '@/supabase';
import { Job } from '@/types/job';
import { useAppContext } from '@/components/filters/FilterContext';

interface PageData {
  jobs: Job[];
  page: number;
}

const PAGE_SIZE = 50;

const mapToJob = (row: any): Job => ({
  id: row.id,
  description: row.description || '',
  attributes: {
    title: row.title || '',
    company: row.company || '',
    country: row.country || 'Chile',
    portal: row.portal || '',
    creation_date: row.creation_date || new Date().toISOString(),
    logo_url: row.logo_url || '',
    region: row.region || null,
    jobType: row.job_type || null,
    salary: row.salary || null,
    minSalary: row.min_salary || null,
    maxSalary: row.max_salary || null,
    category: row.category || null,
    modality: row.modality || 'Presencial',
    experience: row.experience || null,
    jobTitle: row.job_title || '',
  },
  publicUrl: row.public_url || '',
  tags: row.tags || [],
});

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
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('job_offers')
        .select('*')
        .order('creation_date', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      // Apply server-side filters where possible
      if (filters.selectedPortals.size > 0) {
        query = query.in('portal', Array.from(filters.selectedPortals));
      }
      if (filters.selectedCountries.size > 0) {
        query = query.in('country', Array.from(filters.selectedCountries));
      }
      if (filters.selectedRegions.size > 0) {
        query = query.in('region', Array.from(filters.selectedRegions));
      }
      if (filters.company) {
        query = query.ilike('company', `%${filters.company}%`);
      }
      if (filters.selectedModalities.size > 0) {
        query = query.in('modality', Array.from(filters.selectedModalities));
      }
      if (filters.selectedExperiences.size > 0) {
        query = query.in('experience', Array.from(filters.selectedExperiences));
      }
      // For search, categories, subcategories, tags, jobTitles - handle client-side as they may require complex queries

      const { data: rawJobs, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const jobs = rawJobs ? rawJobs.map(mapToJob) : [];

      return { jobs, page: pageParam };
    },
    getNextPageParam: (lastPage: PageData) =>
      lastPage.jobs.length === PAGE_SIZE ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
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
    console.error('[Diagnostic] Fetch jobs error:', error);
  }

  return { jobs, loadMoreJobs, hasMore: hasNextPage, loading: isLoading || isFetching, error, refetch };
};