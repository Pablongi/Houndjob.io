// /frontend/src/hooks/useJobsWithCache.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAppContext } from '@/components/filters/FilterContext';
import { Job } from '@/types/job';
import { logger } from '@/utils/logger';

const PAGE_SIZE = 50;

const mapToJob = (row: any): Job => ({
  id: row.id,
  description: row.description || '',
  attributes: {
    title: row.title || 'Sin título',
    company: row.company || 'Sin empresa',
    country: row.country || 'Chile',
    portal: row.source || '',
    creation_date: row.scraped_at || '',
    logo_url: row.company_logo || '',
    region: row.region || null,
    city: row.city || null,
    salary: row.salary || 'Sin salario',
    experience: row.experience || 'Sin experiencia',
    modality: row.modality || null,
    publicUrl: row.link || '#',
    date_posted: row.date_posted || '',
    views: row.views || 0,
  },
  publicUrl: row.link || '#',
  tags: [],
});

export const useJobsWithCache = () => {
  const { filters } = useAppContext();

  const apiUrl = import.meta.env.VITE_API_URL || 'NO_DEFINIDO';

  logger.info(`🔗 VITE_API_URL detectado: "${apiUrl}"`);

  const query = useInfiniteQuery({
    queryKey: ['jobs', JSON.stringify(filters)],

    queryFn: async ({ pageParam = 0 }) => {
      logger.actionStart(`🔄 Cargando página ${pageParam}`);

      const params = new URLSearchParams({
        page: pageParam.toString(),
        size: PAGE_SIZE.toString(),
      });

      if (filters.selectedPortals.size) params.append('portals', Array.from(filters.selectedPortals).join(','));
      if (filters.selectedModalities.size) params.append('modalities', Array.from(filters.selectedModalities).join(','));
      if (filters.selectedExperiences.size) params.append('experiences', Array.from(filters.selectedExperiences).join(','));
      if (filters.selectedCountries.size) params.append('countries', Array.from(filters.selectedCountries).join(','));
      if (filters.selectedRegions.size) params.append('regions', Array.from(filters.selectedRegions).join(','));
      if (filters.company) params.append('company', filters.company);
      if (filters.search) params.append('search', filters.search);

      const fullUrl = `${apiUrl}/api/jobs?${params.toString()}`;

      logger.info(`📡 Fetching → ${fullUrl}`);

      try {
        const res = await fetch(fullUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        logger.info(`📥 Respuesta recibida - Status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
          const errorText = await res.text();
          logger.error(`❌ Error ${res.status}: ${errorText}`);
          throw new Error(`Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        logger.success(`✅ Página ${pageParam} cargada correctamente (${data.jobs?.length || 0} jobs)`);

        return {
          jobs: data.jobs.map(mapToJob),
          page: pageParam,
          hasMore: data.hasMore ?? false,
        };
      } catch (err: any) {
        logger.error(`💥 Excepción en fetch: ${err.message}`);
        throw err;
      }
    },

    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    jobs: query.data?.pages.flatMap((p) => p.jobs) || [],
    loadMoreJobs: () => query.fetchNextPage(),
    hasMore: query.hasNextPage,
    loading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};