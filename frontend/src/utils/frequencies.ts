// /frontend/src/utils/frequencies.ts
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
  salaries: RankedItem[];          // ←←← AGREGADO
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
  const salaryMap = new Map<string, number>();          // ←←← AGREGADO

  jobs.forEach(job => {
    if (filters) {
      // ... (todo el filtro anterior sin cambios)
      if (filters.search) { /* ... */ }
      if (filters.selectedCategories.size > 0 && !job.tags.some((tag: Tag) => filters.selectedCategories.has(tag.categoría || ''))) return;
      if (filters.selectedSubcategories.size > 0 && !job.tags.some((tag: Tag) => filters.selectedSubcategories.has(tag.subcategoría || ''))) return;
      if (filters.selectedTags.size > 0 && !job.tags.some((tag: Tag) => filters.selectedTags.has(tag.tag))) return;
      if (filters.selectedPortals.size > 0 && !filters.selectedPortals.has(job.attributes.portal)) return;
      if (filters.selectedCountries.size > 0 && !filters.selectedCountries.has(job.attributes.country)) return;
      if (filters.selectedRegions.size > 0 && !filters.selectedRegions.has(job.attributes.region || '')) return;
      if (filters.company) {
        const companyTerm = normalizeText(filters.company);
        if (!normalizeText(job.attributes.company).includes(companyTerm)) return;
      }
      if (filters.selectedJobTitles.size > 0 && !filters.selectedJobTitles.has(job.attributes.title)) return;
      if (filters.selectedModalities.size > 0 && !(job.attributes.modality && filters.selectedModalities.has(job.attributes.modality))) return;
      if (filters.selectedExperiences.size > 0 && !(job.attributes.experience && filters.selectedExperiences.has(job.attributes.experience))) return;
    }

    job.tags.forEach((tag: Tag) => {
      const tagKey = `${tag.tag}-${tag.categoría || 'Sin Categoría'}-${tag.subcategoría || 'Sin Subcategoría'}`;
      if (!tagMap.has(tagKey)) tagMap.set(tagKey, { ...tag, count: 0 });
      tagMap.get(tagKey)!.count += 1;

      categoryMap.set(tag.categoría || 'Sin Categoría', (categoryMap.get(tag.categoría || 'Sin Categoría') || 0) + 1);
      subcategoryMap.set(tag.subcategoría || 'Sin Subcategoría', (subcategoryMap.get(tag.subcategoría || 'Sin Subcategoría') || 0) + 1);
    });

    if (job.attributes.region) regionMap.set(job.attributes.region, (regionMap.get(job.attributes.region) || 0) + 1);

    const companyKey = job.attributes.company;
    companyMap.set(companyKey, {
      name: companyKey,
      count: (companyMap.get(companyKey)?.count || 0) + 1,
      logo: companyMap.get(companyKey)?.logo || job.attributes.logo_url || '',
    });

    const jobTitleKey = job.attributes.title || 'Sin Título';
    jobTitleMap.set(jobTitleKey, (jobTitleMap.get(jobTitleKey) || 0) + 1);

    modalityMap.set(job.attributes.modality || 'Sin Modalidad', (modalityMap.get(job.attributes.modality || 'Sin Modalidad') || 0) + 1);
    experienceMap.set(job.attributes.experience || 'Sin Experiencia', (experienceMap.get(job.attributes.experience || 'Sin Experiencia') || 0) + 1);
    countryMap.set(job.attributes.country || 'Sin País', (countryMap.get(job.attributes.country || 'Sin País') || 0) + 1);

    // ←←← SALARIO
    const salaryKey = job.attributes.salary || 'Sin salario';
    salaryMap.set(salaryKey, (salaryMap.get(salaryKey) || 0) + 1);
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
    salaries: Array.from(salaryMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  };
};