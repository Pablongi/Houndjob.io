import { Job } from '../types/job';

export const countUniqueData = (jobs: Job[], field: keyof Job): Map<string, number> => {
  const countMap = new Map<string, number>();
  const seenIds = new Set<string>();

  jobs.forEach((job) => {
    const value = job[field] as string;
    if (value && !seenIds.has(job.id)) {
      countMap.set(value, (countMap.get(value) || 0) + 1);
      seenIds.add(job.id);
    }
  });

  return countMap;
};