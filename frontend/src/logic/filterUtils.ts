import { Job, Tag } from '@/types/job';
import { FilterState } from '@/types/filter';

export const filterJobs = (jobs: Job[], filters: FilterState): Job[] => {
  let filteredJobs = [...jobs];

  // Portal filter
  if (filters.selectedPortals.size > 0) {
    filteredJobs = filteredJobs.filter(job => {
      const normalizedPortal = normalizeText(job.attributes.portal).toLowerCase();
      return Array.from(filters.selectedPortals).some(portal =>
        normalizedPortal === normalizeText(portal).toLowerCase()
      );
    });
  }

  // Country filter
  if (filters.selectedCountries.size > 0) {
    filteredJobs = filteredJobs.filter(job =>
      filters.selectedCountries.has(job.attributes.country)
    );
  }

  // Region filter
  if (filters.selectedRegions.size > 0) {
    filteredJobs = filteredJobs.filter(job =>
      job.attributes.region && filters.selectedRegions.has(job.attributes.region)
    );
  }

  // Category filter
  if (filters.selectedCategories.size > 0) {
    filteredJobs = filteredJobs.filter(job =>
      job.tags.some((tag: Tag) => filters.selectedCategories.has(tag.categoría || ''))
    );
  }

  // Subcategory filter
  if (filters.selectedSubcategories.size > 0) {
    filteredJobs = filteredJobs.filter(job =>
      job.tags.some((tag: Tag) => filters.selectedSubcategories.has(tag.subcategoría || ''))
    );
  }

  // Tag filter
  if (filters.selectedTags.size > 0) {
    filteredJobs = filteredJobs.filter(job =>
      job.tags.some((tag: Tag) => filters.selectedTags.has(tag.tag))
    );
  }

  // Company filter
  if (filters.company) {
    const companyTerm = normalizeText(filters.company);
    filteredJobs = filteredJobs.filter(job =>
      normalizeText(job.attributes.company).includes(companyTerm)
    );
  }

  // Job title filter
  if (filters.selectedJobTitles.size > 0) {
    filteredJobs = filteredJobs.filter(job =>
      job.attributes.jobTitle && filters.selectedJobTitles.has(job.attributes.jobTitle)
    );
  }

  // Modality filter
  if (filters.selectedModalities.size > 0) {
    filteredJobs = filteredJobs.filter(job =>
      job.attributes.modality && filters.selectedModalities.has(job.attributes.modality)
    );
  }

  // Experience filter
  if (filters.selectedExperiences.size > 0) {
    filteredJobs = filteredJobs.filter(job =>
      job.attributes.experience && filters.selectedExperiences.has(job.attributes.experience)
    );
  }

  // Search term filter
  if (filters.search) {
    const searchTerm = normalizeText(filters.search);
    filteredJobs = filteredJobs.filter(job =>
      normalizeText(job.attributes.title).includes(searchTerm) ||
      normalizeText(job.attributes.company).includes(searchTerm) ||
      normalizeText(job.description).includes(searchTerm) ||
      job.tags.some((tag: Tag) => normalizeText(tag.tag).includes(searchTerm)) ||
      job.tags.some((tag: Tag) => normalizeText(tag.categoría || '').includes(searchTerm)) ||
      job.tags.some((tag: Tag) => normalizeText(tag.subcategoría || '').includes(searchTerm))
    );
  }

  return filteredJobs;
};

// Homogenize regions (e.g., Metropolitana and Santiago (Chile) as same)
export const homogenizeRegions = (region: string): string => {
  const regionMap: { [key: string]: string } = {
    "Santiago (Chile)": "Metropolitana",
    "Talca (Chile)": "Maule",
    "La Serena (Chile)": "Coquimbo",
    "Viña del Mar (Chile)": "Valparaíso",
    "Concepción (Chile)": "Bío Bío",
    "Temuco (Chile)": "La Araucanía",
  };
  return regionMap[region] || region;
};

// Normalize text for consistent comparison
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Extract region from job description
export const extractRegionFromDescription = (description: string, country: string): string | null => {
  const regionMap: { [key: string]: string } = {
    "Región Metropolitana de Santiago": "Metropolitana",
    "Región de Valparaíso": "Valparaíso",
    "Región del Biobío": "Biobío",
    "Tarapacá": "Tarapacá",
    "Antofagasta": "Antofagasta",
    "Atacama": "Atacama",
    "Coquimbo": "Coquimbo",
    "O'Higgins": "O'Higgins",
    "Maule": "Maule",
    "La Araucanía": "La Araucanía",
    "Los Ríos": "Los Ríos",
    "Los Lagos": "Los Lagos",
    "Aysén": "Aysén",
    "Magallanes y Antártica Chilena": "Magallanes y Antártica Chilena",
  };
  const normalizedDesc = normalizeText(description);
  for (const [region, normalized] of Object.entries(regionMap)) {
    if (normalizedDesc.includes(normalizeText(region))) return normalized;
  }
  return null;
};

// Extract modality from job description
export const extractModality = (description: string): string => {
  const modalities = ["presencial", "remoto", "híbrido"];
  const normalizedDesc = normalizeText(description);
  for (const modality of modalities) {
    if (normalizedDesc.includes(modality)) return modality;
  }
  return "presencial"; // Default if not found
};

// Extract experience level from job description
export const extractExperience = (description: string): string | null => {
  const experienceLevels = [
    { key: "senior", value: "Senior" },
    { key: "mid", value: "Mid" },
    { key: "junior", value: "Junior" },
    { key: "5\\+ a", value: "Senior" },
    { key: "3-5 a", value: "Mid" },
    { key: "0-2 a", value: "Junior" },
  ];
  const normalizedDesc = normalizeText(description);
  for (const level of experienceLevels) {
    if (normalizedDesc.includes(level.key)) return level.value;
  }
  return null;
};