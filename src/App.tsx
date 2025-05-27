import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { JobsService } from 'services/JobsService';
import { TagsService } from 'services/TagsService';
import Header from 'components/layout/header';
import Footer from 'components/layout/Footer';
import SearchBar from 'components/search/SearchBar';
import FilterPanel from 'components/filters/FilterPanel';
import JobList from 'components/jobs/JobList';
import { filterJobs } from 'utils/filterUtils';
import { Job, Tag } from 'types/job';
import { FilterState } from 'types/filter';
import { extractRegionFromDescription } from 'utils/filterUtils';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
`;

interface RankedItem {
  name: string;
  count: number;
  logo?: string;
}

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [visibleJobsCount, setVisibleJobsCount] = useState(60); // Initial limit of 60 jobs
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<RankedItem[]>([]);
  const [allCategories, setAllCategories] = useState<RankedItem[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [topCompanies, setTopCompanies] = useState<RankedItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    selectedCategories: new Set(),
    selectedSubcategories: new Set(),
    selectedTags: new Set(),
    selectedPortals: new Set(),
    selectedCountries: new Set(),
    selectedRegions: new Set(),
    company: '',
  });

  useEffect(() => {
    const loadJobs = async () => {
      const jobData = await JobsService.fetchJobs();
      const jobsWithTags = jobData.map(job => ({
        ...job,
        tags: TagsService.extractTags(job.description),
      }));
      setJobs(jobsWithTags);
      setFilteredJobs(jobsWithTags);

      // Log job data to verify region fields
      jobsWithTags.forEach(job => {
        console.log('Job:', job.attributes.portal, 'Country:', job.attributes.country, 'Region:', job.attributes.region);
      });

      // Extract all tags
      const tagCounts: { [key: string]: number } = {};
      const uniqueTagsMap: { [key: string]: Tag } = {};
      jobsWithTags.forEach(job => {
        job.tags.forEach(tag => {
          const tagKey = JSON.stringify(tag);
          if (!uniqueTagsMap[tagKey]) {
            uniqueTagsMap[tagKey] = tag;
          }
        });
      });
      const tags = Object.values(uniqueTagsMap);
      tags.forEach(tag => {
        const key = tag.tag;
        tagCounts[key] = (tagCounts[key] || 0) + jobsWithTags.filter(job => job.tags.some(t => t.tag === key)).length;
      });
      const rankedTags = tags
        .map(tag => ({ ...tag, count: tagCounts[tag.tag] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 tags (updated limit)
      setAllTags(rankedTags);

      // Extract all categories
      const categoryCounts: { [key: string]: number } = {};
      tags.forEach(tag => {
        const key = tag.categoría;
        categoryCounts[key] = (categoryCounts[key] || 0) + jobsWithTags.filter(job => job.tags.some(t => t.categoría === key)).length;
      });
      const rankedCategories = Object.keys(categoryCounts)
        .map(name => ({ name, count: categoryCounts[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 categories
      setAllCategories(rankedCategories);

      // Extract all subcategories
      const subcategoryCounts: { [key: string]: number } = {};
      tags.forEach(tag => {
        const key = tag.subcategoría;
        subcategoryCounts[key] = (subcategoryCounts[key] || 0) + jobsWithTags.filter(job => job.tags.some(t => t.subcategoría === key)).length;
      });
      const rankedSubcategories = Object.keys(subcategoryCounts)
        .map(name => ({ name, count: subcategoryCounts[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 subcategories
      setAllSubcategories(rankedSubcategories);

      // Extract top companies
      const companyCounts: { [key: string]: number } = {};
      const companyLogos: { [key: string]: string } = {};
      jobsWithTags.forEach(job => {
        const key = job.attributes.company;
        companyCounts[key] = (companyCounts[key] || 0) + 1;
        if (!companyLogos[key] && job.attributes.logo_url) {
          companyLogos[key] = job.attributes.logo_url;
        }
      });
      const rankedCompanies = Object.keys(companyCounts)
        .map(name => ({ name, count: companyCounts[name], logo: companyLogos[name] || '' }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 companies (updated limit)
      setTopCompanies(rankedCompanies);

      // Extract all countries (Get On Board)
      const countries = [...new Set(jobsWithTags.map(job => job.attributes.country))];
      setAllCountries(countries);

      // Extract all regions (BNE.cl) and get top 6
      const regionCounts: { [key: string]: number } = {};
      jobsWithTags
        .filter(job => job.attributes.portal === 'BNE.cl')
        .forEach(job => {
          const region = job.attributes.region || extractRegionFromDescription(job.description);
          if (region) {
            regionCounts[region] = (regionCounts[region] || 0) + 1;
          }
        });
      const rankedRegions = Object.keys(regionCounts)
        .map(name => ({ name, count: regionCounts[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6) // Top 6 regions (updated limit)
        .map(item => item.name);
      setAllRegions(rankedRegions);

      // Log filter data for debugging
      console.log('Tags:', rankedTags.length, 'Categories:', rankedCategories.length, 'Subcategories:', rankedSubcategories.length, 'Regions:', rankedRegions.length, 'Companies:', rankedCompanies.length);
    };
    loadJobs();
  }, []);

  // Check if any filters are applied
  const areFiltersApplied = () => {
    return (
      filters.search !== '' ||
      filters.selectedCategories.size > 0 ||
      filters.selectedSubcategories.size > 0 ||
      filters.selectedTags.size > 0 ||
      filters.selectedPortals.size > 0 ||
      filters.selectedCountries.size > 0 ||
      filters.selectedRegions.size > 0 ||
      filters.company !== ''
    );
  };

  const handleFilter = (newFilters: Partial<FilterState>) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      const sortedFilteredJobs = filterJobs(jobs, updatedFilters).sort((a, b) => {
        const dateA = new Date(a.attributes.creation_date);
        const dateB = new Date(b.attributes.creation_date);
        return dateB.getTime() - dateA.getTime(); // Newest to oldest
      });
      setFilteredJobs(sortedFilteredJobs);
      // Reset visible jobs count when filters change
      setVisibleJobsCount(60);
      return updatedFilters;
    });
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      selectedCategories: new Set(),
      selectedSubcategories: new Set(),
      selectedTags: new Set(),
      selectedPortals: new Set(),
      selectedCountries: new Set(),
      selectedRegions: new Set(),
      company: '',
    };
    setFilters(resetFilters);
    const sortedJobs = jobs.sort((a, b) => {
      const dateA = new Date(a.attributes.creation_date);
      const dateB = new Date(b.attributes.creation_date);
      return dateB.getTime() - dateA.getTime(); // Newest to oldest
    });
    setFilteredJobs(sortedJobs);
    setVisibleJobsCount(60);
  };

  const loadMoreJobs = useCallback(() => {
    setVisibleJobsCount(prev => prev + 30); // Load 30 more jobs
  }, []);

  // Determine the jobs to display
  const jobsToDisplay = areFiltersApplied()
    ? filteredJobs.slice(0, visibleJobsCount) // Show all filtered jobs with infinite scroll
    : filteredJobs.slice(0, Math.min(visibleJobsCount, filteredJobs.length)); // Initial limit of 60 jobs

  return (
    <AppContainer>
      <Header onReset={handleReset} filters={filters} onFilter={handleFilter} allCountries={allCountries} />
      <MainContent>
        <SearchBar filters={filters} onFilter={handleFilter} />
        <FilterPanel
          filters={filters}
          onFilter={handleFilter}
          allTags={allTags}
          allCategories={allCategories}
          allSubcategories={allSubcategories}
          allRegions={allRegions}
          topCompanies={topCompanies}
        />
        <JobList
          jobs={jobsToDisplay}
          topTags={allTags.map(tag => tag.tag)}
          loadMoreJobs={loadMoreJobs}
          hasMore={visibleJobsCount < filteredJobs.length}
        />
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

export default App;