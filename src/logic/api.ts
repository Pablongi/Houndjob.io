import { Job, JobAttributes, Tag } from '@/types/job';
import { extractTags } from '@/logic/tags';
import { extractRegionFromDescription, extractModality, extractExperience } from '@/logic/filterUtils';
import { normalizeText } from '@/logic/filterUtils';

// Precompilar expresiones regulares para mejorar el rendimiento
const REGION_REGEX = new RegExp(Object.keys({
  'Región Metropolitana de Santiago': 'Región Metropolitana',
  'Región de Valparaíso': 'Valparaíso',
  'Región del Biobío': 'Biobío',
}).join('|'), 'i');
const MODALITY_REGEX = /\b(remoto|remote|hibrid|hybrid|presencial)\b/i;
const EXPERIENCE_REGEX = /\b(senior|expert|avanzado|5\+ a.*|mid|intermedio|3-5 a.*|junior|entry|principiante|0-2 a.*)\b/i;

const fetchWithRetry = async (url: string, options: RequestInit, retries: number = 3): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error: ${response.status} - ${errorText || 'No additional details'}`);
    }
    return response;
  } catch (error: any) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left) - ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

function decodeHtml(str: string): string {
  const entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&ntilde;': 'ñ',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Ntilde;': 'Ñ',
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
    // Add more entities as needed
  };

  return str.replace(/&[a-zA-Z0-9#]+;/g, (match) => entityMap[match] || match);
}

export const JobsService = {
  async fetchJobs(page: number = 1, limit: number = 50): Promise<Job[]> {
    console.log(`Fetching jobs from page ${page}, limit ${limit}`);
    const endpoint = `https://houndjobback.fly.dev/alloffers?page=${page}&limit=${limit}`;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    };

    try {
      const response = await fetchWithRetry(endpoint, { method: 'GET', headers });
      const data = await response.text();
      console.log('Raw API data:', data.substring(0, 500)); // Log partial raw for debug
      if (!data || data === '[]') {
        console.warn('API returned empty data.');
        return [];
      }
      const parsedData = JSON.parse(data);
      const seenIds = new Set<string>();
      const jobs = parsedData
        .map((rawJob: any, index: number) => JobsService.normalizeJob(rawJob, `${rawJob.id}-${page}-${index}`))
        .filter((job: Job | null): job is Job => {
          if (!job) {
            console.warn('Filtered out invalid job');
            return false;
          }
          if (seenIds.has(job.id)) {
            console.warn(`Duplicate job ID found: ${job.id}`);
            return false;
          }
          seenIds.add(job.id);
          return true;
        });
      console.log(`Fetched ${jobs.length} valid jobs out of ${parsedData.length}.`);
      return jobs;
    } catch (error: any) {
      console.error('Detailed error fetching jobs:', {
        message: error.message,
        stack: error.stack,
        endpoint: endpoint,
      });
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  },

  normalizeJob(rawJob: any, uniqueId: string): Job | null {
    if (!rawJob) {
      console.warn('Empty rawJob');
      return null;
    }
    if (!rawJob.id) {
      console.warn('Invalid job structure (missing id):', JSON.stringify(rawJob, null, 2));
      return null;
    }

    let creationDateValue = rawJob.attributes?.creation_date;
    let parsedDate: Date;
    if (typeof creationDateValue === 'string') {
      if (/^\d{2}\/\d{2}\/\d{2}$/.test(creationDateValue)) {
        const [dd, mm, yy] = creationDateValue.split('/').map(Number);
        parsedDate = new Date(2000 + yy, mm - 1, dd);
      } else if (/^\d+$/.test(creationDateValue)) {
        parsedDate = new Date(Number(creationDateValue) * 1000);
      } else {
        parsedDate = new Date(creationDateValue);
      }
    } else if (typeof creationDateValue === 'number') {
      parsedDate = new Date(creationDateValue * 1000);
    } else {
      console.warn('Invalid creation_date type, using fallback:', typeof creationDateValue);
      parsedDate = new Date();
    }
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid parsed date, using fallback:', creationDateValue);
      parsedDate = new Date();
    }

    const description = decodeHtml(rawJob.description || '');

    const title = decodeHtml(rawJob.attributes?.title || '');

    const company = decodeHtml(rawJob.attributes?.company || '');

    const jobTitle = title ? title.split(/ at | en /i)[0].trim() : '';

    const attributes: JobAttributes = {
      title,
      company,
      country: rawJob.attributes?.country || 'Chile',
      portal: rawJob.attributes?.portal || '',
      creation_date: parsedDate.toISOString(),
      logo_url: rawJob.attributes?.logo_url || '',
      region: rawJob.attributes?.region || (REGION_REGEX.test(description) ? extractRegionFromDescription(description, rawJob.attributes?.country || 'Chile') : null),
      jobType: rawJob.attributes?.job_type || null,
      salary: rawJob.attributes?.salary ? Number(rawJob.attributes.salary) : null,
      minSalary: rawJob.attributes?.minSalary || null,
      maxSalary: rawJob.attributes?.maxSalary || null,
      category: rawJob.attributes?.category || null,
      modality: MODALITY_REGEX.test(description) ? extractModality(description) : 'Presencial',
      experience: EXPERIENCE_REGEX.test(description) ? extractExperience(description) : null,
      jobTitle,
    };

    let publicUrl = rawJob.publicUrl || rawJob.public_url || '';

    if (attributes.portal.toLowerCase().includes('trabajoconsentido') && !publicUrl) {
      const titleSlug = normalizeText(attributes.title)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
      const jobId = rawJob.id;
      publicUrl = `https://www.trabajoconsentido.com/offer/-${titleSlug}-${jobId}`;
    }

    return {
      id: uniqueId,
      description,
      attributes,
      publicUrl,
      tags: extractTags(description),
    };
  },
};