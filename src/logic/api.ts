import { Job, JobAttributes, Tag } from '../types/job';
import { extractTags } from '../logic/tags';

export const JobsService = {
  async fetchJobs(page: number = 1, limit: number = 100): Promise<Job[]> {
    console.log(`Fetching jobs from page ${page}, limit ${limit}`);
    const endpoint = 'https://houndjobback.fly.dev/alloffers';
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    };

    try {
      const response = await fetch(`${endpoint}?page=${page}&limit=${limit}`, { method: 'GET', headers });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.text();
      const parsedData = JSON.parse(data);
      const jobs = parsedData
        .map(JobsService.normalizeJob)
        .filter((job: Job | null): job is Job => job !== null);
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  normalizeJob(rawJob: any): Job | null {
    if (!rawJob || !rawJob.id || !rawJob.description || !rawJob.attributes) return null;

    const attributes: JobAttributes = {
      title: rawJob.attributes.title || '',
      company: rawJob.attributes.company || '',
      country: rawJob.attributes.country || '',
      portal: rawJob.attributes.portal || '',
      creation_date: rawJob.attributes.creation_date || '',
      logo_url: rawJob.attributes.logo_url || '',
      region: rawJob.attributes.region || null,
      jobType: rawJob.attributes.job_type || null,
      salary: rawJob.attributes.salary ? Number(rawJob.attributes.salary) : null,
      minSalary: rawJob.attributes.minSalary || null,
      maxSalary: rawJob.attributes.maxSalary || null,
      category: rawJob.attributes.category || null,
    };

    return {
      id: String(rawJob.id),
      description: String(rawJob.description),
      attributes,
      publicUrl: rawJob.public_url || '',
      tags: extractTags(rawJob.description),
    };
  },
};