import axios from 'axios';
import { TagsService } from './TagsService';

const API_URL = 'https://houndjobback.fly.dev';

interface ApiJob {
  id: string;
  description: string;
  attributes: {
    title: string;
    company: string;
    portal: string;
    creation_date: string | number;
    publicUrl: string;
    logo_url?: string; // Añadido para soportar logo_url
  };
}

interface Filters {
  [key: string]: string | number;
}

interface Job {
  id: string;
  title: string;
  company: string;
  portal: string;
  published: number;
  publicUrl: string;
  tags: string[];
  companyLogo?: string; // Añadido para soportar el logo
}

interface ApiResponse {
  data: Job[];
  total: number;
}

const JobsService = {
  getJobs: async (filters: Filters = {}, maxResults: number = 200): Promise<ApiResponse> => {
    try {
      let url = `${API_URL}/alloffers`;
      let params: { [key: string]: string | number } = {};

      if (filters.search) {
        url = `${API_URL}/offers`;
        params = { ...params, jobs: filters.search };
      }

      const response = await axios.get(url, { params }).catch((error) => {
        console.error(`Error fetching jobs:`, error.response?.data || error.message);
        return { data: [], total: 0 };
      });

      const allJobs: ApiJob[] = Array.isArray(response.data) ? response.data : [];
      console.log('Jobs fetched from API:', allJobs); // Depuración

      const normalizeCreationDate = (creationDate: string | number, portal: string): number => {
        if (!creationDate) return 0;
        if (portal === 'Get On Board') {
          const timestamp = parseInt(creationDate.toString(), 10);
          return isNaN(timestamp) || timestamp <= 0 ? 0 : timestamp;
        }
        const [day, month, year] = creationDate.toString().split('/').map(Number);
        const fullYear = year < 100 ? 2000 + year : year;
        return Math.floor(new Date(fullYear, month - 1, day).getTime() / 1000);
      };

      const normalizeJob = (job: ApiJob): Job => {
        const portal = job.attributes.portal || 'Unknown';
        const description = job.description || '';
        console.log(`Description for job ${job.attributes.title}:`, description); // Depuración
        const tags = description ? TagsService.extractTags(description) : [];
        console.log(`Tags extracted for job ${job.attributes.title}:`, tags); // Depuración

        return {
          id: job.id || `job-${Date.now()}-${Math.random()}`,
          title: job.attributes.title || 'Untitled Job',
          company: job.attributes.company || 'Unknown Company',
          portal,
          published: normalizeCreationDate(job.attributes.creation_date, portal),
          publicUrl: job.attributes.publicUrl || '#',
          tags,
          companyLogo: job.attributes.logo_url || undefined, // Usamos logo_url directamente
        };
      };

      const uniqueJobs: Job[] = allJobs
        .filter((job: ApiJob, index: number, self: ApiJob[]) => index === self.findIndex((j) => j.id === job.id))
        .map(normalizeJob)
        .sort((a, b) => b.published - a.published)
        .slice(0, maxResults);

      return { data: uniqueJobs, total: uniqueJobs.length };
    } catch (error: any) {
      console.error('Error fetching jobs:', error.response?.data || error.message);
      return { data: [], total: 0 };
    }
  },

  formatPublishedDate: (published: number, portal: string): string => {
    if (published === 0) return 'N/A';
    const now = Date.now();
    const publishedDate = published * 1000; // Convertir a milisegundos
    const diffMs = now - publishedDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} día${diffDays > 1 ? 's' : ''} atrás`;
    if (diffHours > 0) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
  },

  getCompanyLogo: async (companyId: string): Promise<string | undefined> => {
    try {
      const response = await axios.get(`${API_URL}/companies/${companyId}`);
      return response.data.logo || undefined;
    } catch (error) {
      console.error(`Error fetching company logo for ${companyId}:`, error);
      return undefined;
    }
  },
};

export default JobsService;