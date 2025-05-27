import { Job } from 'types/job';

export class JobsService {
  static async fetchJobs(): Promise<Job[]> {
    try {
      const response = await fetch('https://houndjobback.fly.dev/alloffers', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs from houndjobback: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Expected an array of jobs from the API');
      }

      return data.map(this.normalizeJob).filter((job): job is Job => job !== null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  private static normalizeJob(job: any): Job | null {
    if (!job || !job.id || !job.description || !job.attributes || !job.publicUrl) {
      console.warn('Skipping job with missing required fields:', job);
      return null;
    }

    const attributes = job.attributes;
    if (
      !attributes.title ||
      !attributes.company ||
      !attributes.country ||
      !attributes.portal ||
      !attributes.creation_date ||
      !attributes.logo_url
    ) {
      console.warn('Skipping job with missing required attributes:', job);
      return null;
    }

    // Normalize creation_date
    let creationDate: Date;
    if (attributes.portal === 'Get On Board') {
      // Unix timestamp in seconds
      creationDate = new Date(Number(attributes.creation_date) * 1000);
    } else if (attributes.portal === 'BNE.cl') {
      // DD/MM/YY format (e.g., "23/05/25")
      const [day, month, year] = attributes.creation_date.split('/').map(Number);
      // Assume years are in the 2000s (e.g., "25" -> 2025)
      creationDate = new Date(2000 + year, month - 1, day);
    } else {
      console.warn('Unknown portal for date parsing:', attributes.portal);
      return null;
    }

    // Enhanced jobType extraction with more variations
    let jobType: string | undefined;
    const descLower = job.description.toLowerCase().replace(/[-]/g, ' ');
    const titleLower = attributes.title.toLowerCase().replace(/[-]/g, ' ');
    if (
      descLower.includes('full time') ||
      descLower.includes('fulltime') ||
      titleLower.includes('full time') ||
      titleLower.includes('fullstack') ||
      descLower.includes('developer') || // Additional variation
      descLower.includes('engineer') ||  // Additional variation
      attributes.country === 'Remote'    // Assume remote jobs are often full-time
    ) {
      jobType = 'Full-time';
    } else if (
      descLower.includes('part time') ||
      descLower.includes('parttime') ||
      titleLower.includes('part time')
    ) {
      jobType = 'Part-time';
    } else if (
      descLower.includes('freelance') ||
      descLower.includes('freelancer') ||
      titleLower.includes('freelance')
    ) {
      jobType = 'Freelance';
    }

    // Normalize region with detailed logging
    let region: string | null = null;
    if (attributes.region !== undefined && attributes.region !== null) {
      region = String(attributes.region);
      console.log(`Job ID: ${job.id}, Portal: ${attributes.portal}, Raw Region: ${attributes.region}, Normalized Region: ${region}`);
    } else {
      console.log(`Job ID: ${job.id}, Portal: ${attributes.portal}, Raw Region: ${attributes.region}, Region is null or undefined`);
    }

    console.log(`Job ID: ${job.id}, Portal: ${attributes.portal}, JobType: ${jobType || 'Not found'}, Region: ${region || 'Not set'}`);

    return {
      id: String(job.id),
      description: String(job.description),
      attributes: {
        title: String(attributes.title),
        company: String(attributes.company),
        country: String(attributes.country),
        portal: String(attributes.portal),
        creation_date: creationDate.toISOString(),
        logo_url: String(attributes.logo_url),
        region,
      },
      publicUrl: String(job.publicUrl),
      tags: [],
      jobType,
    };
  }
}