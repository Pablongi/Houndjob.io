import { FilterState } from '../types/filter';
import { Job, Tag } from '../types/job';

export const normalizeText = (text: string): string => text.toLowerCase().trim();

const REGIONS_CHILE = {
  'Región Metropolitana de Santiago': 'Región Metropolitana',
  'Región de Valparaíso': 'Valparaíso',
  'Región del Biobío': 'Biobío',
  'Región de La Araucanía': 'Araucanía',
  'Región de Los Lagos': 'Los Lagos',
  'Región de Antofagasta': 'Antofagasta',
  'Región de Atacama': 'Atacama',
  'Región de Coquimbo': 'Coquimbo',
  'Región de Los Ríos': 'Los Ríos',
  'Región de Magallanes y de la Antártida Chilena': 'Magallanes',
  'Región de Tarapacá': 'Tarapacá',
  'Región de Arica y Parinacota': 'Arica y Parinacota',
  'Región de Ñuble': 'Ñuble',
  'Región de O’Higgins': 'O’Higgins', // Corrección de "ConcurrentO’Higgins"
  'Región del Maule': 'Maule',
  'Región de Aysén del General Carlos Ibáñez del Campo': 'Aysén',
};

export const extractRegionFromDescription = (description: string, country: string): string | null => {
  if (country !== 'Chile') return null;
  const normalizedDescription = normalizeText(description);
  for (const region in REGIONS_CHILE) {
    if (normalizedDescription.includes(normalizeText(region))) {
      return REGIONS_CHILE[region as keyof typeof REGIONS_CHILE];
    }
  }
  return null;
};

export const filterJobs = (jobs: Job[], filters: FilterState): Job[] => {
  let filteredJobs = [...jobs];

  if (filters.search) {
    const searchTerm = normalizeText(filters.search);
    filteredJobs = filteredJobs.filter((job) =>
      normalizeText(job.attributes.title).includes(searchTerm) ||
      normalizeText(job.attributes.company).includes(searchTerm) ||
      normalizeText(job.description).includes(searchTerm)
    );
  }

  if (filters.selectedCategories.size > 0) {
    filteredJobs = filteredJobs.filter((job) =>
      job.tags.some((tag: Tag) => filters.selectedCategories.has(tag.categoría || ''))
    );
  }

  if (filters.selectedSubcategories.size > 0) {
    filteredJobs = filteredJobs.filter((job) =>
      job.tags.some((tag: Tag) => filters.selectedSubcategories.has(tag.subcategoría || ''))
    );
  }

  if (filters.selectedTags.size > 0) {
    filteredJobs = filteredJobs.filter((job) =>
      job.tags.some((tag: Tag) => filters.selectedTags.has(tag.tag))
    );
  }

  if (filters.selectedPortals.size > 0) {
    filteredJobs = filteredJobs.filter((job) => filters.selectedPortals.has(job.attributes.portal));
  }

  if (filters.selectedCountries.size > 0) {
    filteredJobs = filteredJobs.filter((job) => filters.selectedCountries.has(job.attributes.country));
  }

  if (filters.selectedRegions.size > 0) {
    filteredJobs = filteredJobs.filter((job) => {
      const region = job.attributes.region || extractRegionFromDescription(job.description, job.attributes.country);
      return region ? filters.selectedRegions.has(region) : false;
    });
  }

  if (filters.company) {
    const companyTerm = normalizeText(filters.company);
    filteredJobs = filteredJobs.filter((job) => normalizeText(job.attributes.company).includes(companyTerm));
  }

  if (filters.sortMode) {
    switch (filters.sortMode) {
      case 'recommended':
        filteredJobs.sort((a, b) => {
          const aTagsMatch = a.tags.filter((tag) => filters.selectedTags.has(tag.tag)).length;
          const bTagsMatch = b.tags.filter((tag) => filters.selectedTags.has(tag.tag)).length;
          return bTagsMatch - aTagsMatch;
        });
        break;
      case 'latest':
        filteredJobs.sort((a, b) => new Date(b.attributes.creation_date).getTime() - new Date(a.attributes.creation_date).getTime());
        break;
      case 'salary':
        filteredJobs.sort((a, b) => (b.attributes.salary || 0) - (a.attributes.salary || 0));
        break;
    }
  }

  return filteredJobs;
};