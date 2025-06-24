import FilterPanel from '@/components/filters/FilterPanel';
import { Job, Tag, RankedItem } from '../types/job';


interface Frequencies {
  tags: Tag[];
  categories: RankedItem[];
  subcategories: RankedItem[];
  regions: string[];
  companies: RankedItem[];
}

export const computeFrequencies = (jobs: Job[]): Frequencies => {
  const tagCounts: { [key: string]: number } = {};
  const uniqueTagsMap: { [key: string]: Tag } = {};

  jobs.forEach((job) => {
    job.tags.forEach((tag) => {
      const tagKey = JSON.stringify(tag);
      if (!uniqueTagsMap[tagKey]) {
        uniqueTagsMap[tagKey] = tag;
      }
    });
  });

  const tags: Tag[] = Object.values(uniqueTagsMap);
  tags.forEach((tag) => {
    const key = tag.tag;
    tagCounts[key] = (tagCounts[key] || 0) + jobs.filter((job) => job.tags.some((t) => t.tag === key)).length;
  });

  const allTags: Tag[] = tags
    .map((tag) => ({ ...tag, count: tagCounts[tag.tag] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const categoryCounts: { [key: string]: number } = {};
  tags.forEach((tag) => {
    const key = tag.categoría;
    categoryCounts[key] = (categoryCounts[key] || 0) + jobs.filter((job) => job.tags.some((t) => t.categoría === key)).length;
  });

  const allCategories: RankedItem[] = Object.keys(categoryCounts)
    .map((name) => ({ name, count: categoryCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const subcategoryCounts: { [key: string]: number } = {};
  tags.forEach((tag) => {
    const key = tag.subcategoría;
    subcategoryCounts[key] = (subcategoryCounts[key] || 0) + jobs.filter((job) => job.tags.some((t) => t.subcategoría === key)).length;
  });

  const allSubcategories: RankedItem[] = Object.keys(subcategoryCounts)
    .map((name) => ({ name, count: subcategoryCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const regionCounts: { [key: string]: number } = {};
  jobs
    .filter((job) => job.attributes.portal === 'BNE.cl')
    .forEach((job) => {
      const region = job.attributes.region || FilterPanel(job.description, job.attributes.country);
      if (region) {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    });

  const allRegions: string[] = Object.keys(regionCounts)
    .map((name) => ({ name, count: regionCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item) => item.name);

  const companyCounts: { [key: string]: number } = {};
  const companyLogos: { [key: string]: string } = {};
  jobs.forEach((job) => {
    const key = job.attributes.company;
    companyCounts[key] = (companyCounts[key] || 0) + 1;
    if (!companyLogos[key] && job.attributes.logo_url) {
      companyLogos[key] = job.attributes.logo_url;
    }
  });

  const topCompanies: RankedItem[] = Object.keys(companyCounts)
    .map((name) => ({ name, count: companyCounts[name], logo: companyLogos[name] || '' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    tags: allTags,
    categories: allCategories,
    subcategories: allSubcategories,
    regions: allRegions,
    companies: topCompanies,
  };
};