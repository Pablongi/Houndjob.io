import { Job } from 'types/job';
import { FilterState } from 'types/filter';

export const filterJobs = (jobs: Job[], filters: FilterState): Job[] => {
  console.log('Filter State - Selected Portals:', Array.from(filters.selectedPortals));

  return jobs.filter(job => {
    const { search, selectedCategories, selectedSubcategories, selectedTags, selectedPortals, selectedCountries, selectedRegions, company } = filters;

    // Normalize job portal due to data mismatch
    const jobPortal = job.attributes.portal === 'Get On Board' ? 'BNE.cl' : job.attributes.portal === 'BNE.cl' ? 'Get On Board' : job.attributes.portal;
    console.log('Job:', job.attributes.title, 'Original Portal:', job.attributes.portal, 'Normalized Portal:', jobPortal);

    // Search filter (title or description)
    if (search && !job.attributes.title.toLowerCase().includes(search.toLowerCase()) && !job.description.toLowerCase().includes(search.toLowerCase())) {
      console.log('Job Excluded - Search:', job.attributes.title);
      return false;
    }

    // Categories filter
    if (selectedCategories.size > 0 && !job.tags.some(tag => selectedCategories.has(tag.categoría))) {
      console.log('Job Excluded - Categories:', job.attributes.title);
      return false;
    }

    // Subcategories filter
    if (selectedSubcategories.size > 0 && !job.tags.some(tag => selectedSubcategories.has(tag.subcategoría))) {
      console.log('Job Excluded - Subcategories:', job.attributes.title);
      return false;
    }

    // Tags filter
    if (selectedTags.size > 0 && !job.tags.some(tag => selectedTags.has(tag.tag))) {
      console.log('Job Excluded - Tags:', job.attributes.title);
      return false;
    }

    // Portals filter
    if (selectedPortals.size > 0 && !selectedPortals.has(jobPortal)) {
      console.log('Job Excluded - Portals:', job.attributes.title, 'Normalized Job Portal:', jobPortal, 'Selected Portals:', Array.from(selectedPortals));
      return false;
    }

    // Countries filter (used for Get On Board jobs)
    if (selectedCountries.size > 0 && !selectedCountries.has(job.attributes.country)) {
      console.log('Job Excluded - Countries:', job.attributes.title, 'Country:', job.attributes.country);
      return false;
    }

    // Regions filter (applies to all jobs)
    if (selectedRegions.size > 0) {
      console.log('Applying Region Filter - Job:', job.attributes.title, 'Portal:', jobPortal, 'Region:', job.attributes.region);
      if (jobPortal === 'BNE.cl') {
        const region = job.attributes.region || extractRegionFromDescription(job.description);
        if (!region) {
          console.log('BNE.cl Job Excluded - Region: null, Job:', job.attributes.title, 'Description:', job.description);
          return false;
        }
        const regionLower = region.toLowerCase();
        const selectedRegionsLower = Array.from(selectedRegions).map(r => r.toLowerCase());
        if (!selectedRegionsLower.includes(regionLower)) {
          console.log('BNE.cl Job Excluded - Region:', region, 'Job:', job.attributes.title, 'Selected Regions (lowercase):', selectedRegionsLower);
          return false;
        }
        console.log('BNE.cl Job Included - Region:', region, 'Job:', job.attributes.title);
      } else {
        console.log('Get On Board Job Excluded - Region:', job.attributes.region, 'Job:', job.attributes.title);
        return false;
      }
    }

    // Company filter
    if (company && job.attributes.company !== company) {
      console.log('Job Excluded - Company:', job.attributes.title, 'Company:', job.attributes.company);
      return false;
    }

    console.log('Job Included:', job.attributes.title, 'Normalized Portal:', jobPortal, 'Region:', job.attributes.region);
    return true;
  });
};

export const extractRegionFromDescription = (desc: string): string | null => {
  const regions = ['Maule', 'Aysén', 'Metropolitana', 'Valparaíso', 'Los Lagos', 'Biobío', 'Coquimbo']; // Added Coquimbo
  const cleanDesc = desc.toLowerCase();
  const matchedRegion = regions.find(region => cleanDesc.includes(region.toLowerCase()));
  console.log('Extracted Region from Description:', matchedRegion, 'Description:', desc);
  return matchedRegion || null;
};