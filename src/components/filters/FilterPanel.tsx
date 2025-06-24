import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import WindowsSearcher from '@/components/filters/WindowsSearcher';
import HotJobs from '@/components/home/HotJobs';
import { FilterState, RankedItem } from '@/types/filter';
import { Job, Tag } from '@/types/job';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const FilterPanelContainer = styled(motion.div)<{ mode: 'rows' | 'tabs' }>`
  width: 100%;
  padding: 16px;
  background: var(--background-panel, #ffffff);
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  ${({ mode }) =>
    mode === 'rows'
      ? `height: auto; min-height: 20vh;`
      : `height: 40vh; overflow-y: auto;`}
  position: relative;
`;

interface FilterPanelProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  allTags: Tag[];
  allCategories: RankedItem[];
  allSubcategories: RankedItem[];
  allRegions: string[];
  topCompanies: RankedItem[];
  mode: 'rows' | 'tabs';
  jobs?: Job[];
  topTags?: string[];
  loadMoreJobs?: () => void;
  hasMore?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilter,
  onReset,
  allTags,
  allCategories,
  allSubcategories,
  allRegions,
  topCompanies,
  mode,
  jobs = [],
  topTags = [],
  loadMoreJobs = () => {},
  hasMore = false,
}) => {
  console.log('FilterPanel component mounted with jobs:', jobs.length);
  return (
    <FilterPanelContainer mode={mode}>
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
        jobs={jobs}
        topTags={topTags}
        loadMoreJobs={loadMoreJobs}
        hasMore={hasMore}
        filters={filters}
        onFilter={onFilter}
      />
    </FilterPanelContainer>
  );
};

export default FilterPanel;