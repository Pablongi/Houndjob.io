import React from 'react';
import styled from 'styled-components';
import WindowsSearcher from './WindowsSearcher';
import HotJobs from '../home/HotJobs';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { FilterState, RankedItem } from '../../types/filter';
import { Tag } from '../../types/job';

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
`;

interface FiltersProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  allTags: Tag[];
  allCategories: RankedItem[];
  allSubcategories: RankedItem[];
  allRegions: string[];
  topCompanies: RankedItem[];
  jobs: any[];
  topTags: string[];
  loadMoreJobs: () => void;
  hasMore: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilter,
  onReset,
  allTags,
  allCategories,
  allSubcategories,
  allRegions,
  topCompanies,
  jobs,
  topTags,
  loadMoreJobs,
  hasMore,
}) => {
  return (
    <FiltersContainer>
      <Header
        filters={filters}
        onFilter={onFilter}
        allTags={allTags}
        allCategories={allCategories}
        allSubcategories={allSubcategories}
        allRegions={allRegions}
        topCompanies={topCompanies}
      />
      <WindowsSearcher
        filters={filters}
        onFilter={onFilter}
        onReset={onReset}
        allTags={allTags}
        allCategories={allCategories}
        allSubcategories={allSubcategories}
        allRegions={allRegions}
        topCompanies={topCompanies}
      />
      <HotJobs
        jobs={jobs} // Infinito en Filters
        topTags={topTags}
        loadMoreJobs={loadMoreJobs}
        hasMore={hasMore}
        filters={filters}
        onFilter={onFilter}
      />
      <Footer />
    </FiltersContainer>
  );
};

export default Filters;