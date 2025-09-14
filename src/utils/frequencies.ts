import { Job, Tag, RankedItem } from '@/types/job';
import { normalizeText } from '@/logic/filterUtils';
import { FilterState } from '@/types/filter';

interface Frequencies {
  tags: Tag[];
  categories: RankedItem[];
  subcategories: RankedItem[];
  regions: RankedItem[];
  companies: RankedItem[];
  jobTitles: RankedItem[];
  modalities: RankedItem[];
  experiences: RankedItem[];
  countries: RankedItem[];
}

export const computeFrequencies = (jobs: Job[], filters?: FilterState): Frequencies => {
  const tagMap = new Map<string, Tag>();
  const categoryMap = new Map<string, number>();
  const subcategoryMap = new Map<string, number>();
  const regionMap = new Map<string, number>();
  const companyMap = new Map<string, RankedItem>();
  const jobTitleMap = new Map<string, number>();
  const modalityMap = new Map<string, number>();
  const experienceMap = new Map<string, number>();
  const countryMap = new Map<string, number>();

  jobs.forEach(job => {
    // Apply filters if provided
    if (filters) {
      if (filters.search) {
        const searchTerm = normalizeText(filters.search);
        if (
          !normalizeText(job.attributes.title).includes(searchTerm) &&
          !normalizeText(job.attributes.company).includes(searchTerm) &&
          !normalizeText(job.description).includes(searchTerm) &&
          !job.tags.some(tag => normalizeText(tag.tag).includes(searchTerm)) &&
          !job.tags.some(tag => normalizeText(tag.categoría || '').includes(searchTerm)) &&
          !job.tags.some(tag => normalizeText(tag.subcategoría || '').includes(searchTerm))
        ) {
          return;
        }
      }
      if (filters.selectedCategories.size > 0 && !job.tags.some(tag => filters.selectedCategories.has(tag.categoría || ''))) {
        return;
      }
      if (filters.selectedSubcategories.size > 0 && !job.tags.some(tag => filters.selectedSubcategories.has(tag.subcategoría || ''))) {
        return;
      }
      if (filters.selectedTags.size > 0 && !job.tags.some(tag => filters.selectedTags.has(tag.tag))) {
        return;
      }
      if (filters.selectedPortals.size > 0 && !filters.selectedPortals.has(job.attributes.portal)) {
        return;
      }
      if (filters.selectedCountries.size > 0 && !filters.selectedCountries.has(job.attributes.country)) {
        return;
      }
      if (filters.selectedRegions.size > 0 && !filters.selectedRegions.has(job.attributes.region || '')) {
        return;
      }
      if (filters.company) {
        const companyTerm = normalizeText(filters.company);
        if (!normalizeText(job.attributes.company).includes(companyTerm)) {
          return;
        }
      }
      if (filters.selectedJobTitles.size > 0 && !(job.attributes.jobTitle && filters.selectedJobTitles.has(job.attributes.jobTitle))) {
        return;
      }
      if (filters.selectedModalities.size > 0 && !(job.attributes.modality && filters.selectedModalities.has(job.attributes.modality))) {
        return;
      }
      if (filters.selectedExperiences.size > 0 && !(job.attributes.experience && filters.selectedExperiences.has(job.attributes.experience))) {
        return;
      }
    }

    // Compute frequencies
    job.tags.forEach((tag: Tag) => {
      const tagKey = `${tag.tag}-${tag.categoría || 'Sin Categoría'}-${tag.subcategoría || 'Sin Subcategoría'}`;
      if (!tagMap.has(tagKey)) {
        tagMap.set(tagKey, { ...tag, count: 0 });
      }
      tagMap.get(tagKey)!.count += 1;

      const categoryKey = tag.categoría || 'Sin Categoría';
      categoryMap.set(categoryKey, (categoryMap.get(categoryKey) || 0) + 1);

      const subcategoryKey = tag.subcategoría || 'Sin Subcategoría';
      subcategoryMap.set(subcategoryKey, (subcategoryMap.get(subcategoryKey) || 0) + 1);
    });

    const region = job.attributes.region;
    if (region) {
      regionMap.set(region, (regionMap.get(region) || 0) + 1);
    }

    const companyKey = job.attributes.company;
    companyMap.set(companyKey, {
      name: companyKey,
      count: (companyMap.get(companyKey)?.count || 0) + 1,
      logo: companyMap.get(companyKey)?.logo || job.attributes.logo_url || '',
    });

    const jobTitleKey = job.attributes.jobTitle || 'Sin Título';
    jobTitleMap.set(jobTitleKey, (jobTitleMap.get(jobTitleKey) || 0) + 1);

    const modalityKey = job.attributes.modality || 'Sin Modalidad';
    modalityMap.set(modalityKey, (modalityMap.get(modalityKey) || 0) + 1);

    const experienceKey = job.attributes.experience || 'Sin Experiencia';
    experienceMap.set(experienceKey, (experienceMap.get(experienceKey) || 0) + 1);

    const countryKey = job.attributes.country || 'Sin País';
    countryMap.set(countryKey, (countryMap.get(countryKey) || 0) + 1);
  });

  return {
    tags: Array.from(tagMap.values()).sort((a, b) => b.count - a.count),
    categories: Array.from(categoryMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    subcategories: Array.from(subcategoryMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    regions: Array.from(regionMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    companies: Array.from(companyMap.values()).sort((a, b) => b.count - a.count),
    jobTitles: Array.from(jobTitleMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    modalities: Array.from(modalityMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    experiences: Array.from(experienceMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    countries: Array.from(countryMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  };
};