import axios from 'axios';
import { TagsService } from './TagsService';

const API_URL = ''; // Use proxy in package.json

interface ApiJob {
  id: string;
  type: string | null;
  description: string;
  attributes: {
    title: string;
    company: string;
    portal: string;
    creation_date: string | number;
    logo_url?: string;
  };
  publicUrl: string;
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
  companyLogo?: string;
  rawCreationDate?: string | number; // Added for debugging
}

interface ApiResponse {
  data: Job[];
  total: number;
}

interface TimeFromPublishedResult {
  display: string;
  isNew: boolean;
  isToday: boolean;
}

const JobsService = {
  getJobs: async (filters: Filters = {}): Promise<ApiResponse> => {
    try {
      let url = `${API_URL}/alloffers`;
      let params: { [key: string]: string | number } = {};

      if (filters.search) {
        url = `${API_URL}/offers`;
        params = { ...params, jobs: filters.search };
      }

      const response = await axios.get(url, { params });
      const allJobs: ApiJob[] = Array.isArray(response.data) ? response.data : [];
      console.log('Jobs fetched from API:', allJobs);

      const normalizeCreationDate = (creationDate: string | number, portal: string): number => {
        if (!creationDate) {
          console.warn(`Invalid creation_date for ${portal}:`, creationDate);
          return 0;
        }

        if (portal === 'Get On Board') {
          const timestamp = Number(creationDate);
          if (isNaN(timestamp) || timestamp <= 0) {
            console.warn(`Invalid Unix timestamp for Get On Board:`, creationDate);
            return 0;
          }
          console.log(`Get On Board timestamp parsed: ${timestamp}, Date: ${new Date(timestamp * 1000).toISOString()}`);
          return timestamp; // Already in seconds
        }

        // Handle BNE.cl format (DD/MM/YY)
        const dateStr = String(creationDate);
        const [day, month, year] = dateStr.split('/').map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
          console.warn(`Invalid date format for BNE.cl:`, creationDate);
          return 0;
        }
        // Handle two-digit year (assume 20YY for 2025 and beyond)
        const fullYear = year < 100 ? (year >= 25 ? 2000 + year : 2025 + year - 100) : year;
        const date = new Date(fullYear, month - 1, day);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid parsed date for BNE.cl:`, creationDate);
          return 0;
        }
        const timestamp = Math.floor(date.getTime() / 1000);
        console.log(`BNE.cl date parsed: ${timestamp}, Date: ${new Date(timestamp * 1000).toISOString()}`);
        return timestamp;
      };

      const normalizeJob = (job: ApiJob): Job => {
        const portal = job.attributes.portal || 'Unknown';
        const description = job.description || '';
        console.log(`Description for job ${job.attributes.title}:`, description);
        const tags = description ? TagsService.extractTags(description) : [];
        console.log(`Tags extracted for job ${job.attributes.title}:`, tags);

        const published = normalizeCreationDate(job.attributes.creation_date, portal);
        console.log(`Normalized creation_date for ${job.attributes.title} (${portal}):`, {
          raw: job.attributes.creation_date,
          parsed: published,
          date: published ? new Date(published * 1000).toISOString() : 'N/A',
        });

        return {
          id: job.id || `job-${Date.now()}-${Math.random()}`,
          title: job.attributes.title.replace(/[\u00E1\u00E9\u00ED\u00F3\u00FA]/g, (match) => ({
            '\u00E1': 'a', '\u00E9': 'e', '\u00ED': 'i', '\u00F3': 'o', '\u00FA': 'u'
          }[match] || match)) || 'Untitled Job',
          company: job.attributes.company || 'Unknown Company',
          portal,
          published,
          publicUrl: job.publicUrl || '#',
          tags,
          companyLogo: job.attributes.logo_url || undefined,
          rawCreationDate: job.attributes.creation_date, // Store raw value for debugging
        };
      };

      const twoWeeksAgo = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60;
      console.log('Two weeks ago timestamp:', twoWeeksAgo, new Date(twoWeeksAgo * 1000).toISOString());

      const uniqueJobs: Job[] = allJobs
      .filter((job: ApiJob, index: number, self: ApiJob[]) => index === self.findIndex((j) => j.id === job.id))
      .map(normalizeJob)
      // .filter((job: Job) => {
      //   if (job.published === 0) {
      //     console.warn(`Excluding job ${job.title} (${job.portal}) due to invalid published date`);
      //     return false;
      //   }
      //   const isRecent = job.published >= twoWeeksAgo;
      //   console.log(`Job ${job.title} (${job.portal}) - Raw creation_date: ${job.rawCreationDate}, Normalized published: ${job.published}, twoWeeksAgo: ${twoWeeksAgo}, isRecent: ${isRecent}`, {
      //     published: job.published,
      //     date: new Date(job.published * 1000).toISOString(),
      //     twoWeeksAgoDate: new Date(twoWeeksAgo * 1000).toISOString()
      //   });
      //   return isRecent;
      // })
      .sort((a, b) => b.published - a.published);

      console.log('Filtered and sorted jobs:', uniqueJobs.length, uniqueJobs);

      return { data: uniqueJobs, total: uniqueJobs.length };
    } catch (error: any) {
      const errorMessage = error.response
        ? `API request failed with status ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message === 'Network Error'
        ? 'Network error: Unable to reach the API server. Please check your internet connection or the server status.'
        : `Unexpected error: ${error.message}`;
      console.error('Error fetching jobs:', errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  TimeFromPublished: (published: number, portal: string): TimeFromPublishedResult => {
    if (!published || published === 0) {
      console.warn(`Invalid published timestamp for ${portal}:`, published);
      return { display: 'N/A', isNew: false, isToday: false };
    }

    const now = Date.now() / 1000; // Current time in seconds
    const diffSeconds = now - published;

    const secondsInMinute = 60;
    const secondsInHour = 60 * 60;
    const secondsInDay = 24 * 60 * 60;

    // Use UTC for consistency with Get On Board timestamps
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const publishedDay = new Date(published * 1000);
    publishedDay.setUTCHours(0, 0, 0, 0);
    const isToday = today.getTime() === publishedDay.getTime();
    const isNew = diffSeconds < secondsInHour;

    console.log(`TimeFromPublished for ${portal} at ${new Date(now * 1000).toISOString()}:`, {
      published,
      date: publishedDay.toISOString(),
      diffSeconds,
      isNew,
      isToday,
    });

    if (diffSeconds < secondsInMinute) {
      return { display: `${Math.floor(diffSeconds)}s`, isNew, isToday };
    } else if (diffSeconds < secondsInHour) {
      return { display: `${Math.floor(diffSeconds / secondsInMinute)} min`, isNew, isToday };
    } else if (diffSeconds < secondsInDay) {
      return { display: `${Math.floor(diffSeconds / secondsInHour)}h`, isNew, isToday };
    } else {
      return { display: `${Math.floor(diffSeconds / secondsInDay)}d`, isNew, isToday };
    }
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