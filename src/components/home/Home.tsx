import React, { useEffect, useState, Suspense } from 'react';
import styled from 'styled-components';
import { FilterState } from '../../types/filter';
import { Job, Tag } from '../../types/job';
import { RankedItem } from '../../types/filter';
import Searcher from './Searcher';
import FilterPanel from '../filters/FilterPanel';
const HotJobs = React.lazy(() => import('./HotJobs')); // Lazy loading aquí

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 62vh;
  font-size: 16px;
  color: var(--zhipin-text);
`;

interface HomeProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  allTags: Tag[];
  allCategories: RankedItem[];
  allSubcategories: RankedItem[];
  allRegions: string[];
  topCompanies: RankedItem[];
  jobs: Job[];
  topTags: string[];
  loadMoreJobs: () => void;
  hasMore: boolean;
}

const Home: React.FC<HomeProps> = ({
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
  console.log('[Home Diagnostic] Renderizando componente Home con', jobs.length, 'empleos');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[Home Diagnostic] useEffect - Iniciando carga inicial...');
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('[Home Diagnostic] useEffect - Carga inicial completada.');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    console.log('[Home Diagnostic] Renderizando LoadingSpinner...');
    return <LoadingSpinner>Loading jobs...</LoadingSpinner>;
  }

  return (
    <HomeContainer>
      <Searcher
        filters={filters}
        onFilter={onFilter}
        onReset={onReset}
        allTags={allTags}
        allCategories={allCategories}
        allSubcategories={allSubcategories}
        allRegions={allRegions}
        topCompanies={topCompanies}
      />
      <FilterPanel
        filters={filters}
        onFilter={onFilter}
        onReset={onReset}
        allTags={allTags}
        allCategories={allCategories}
        allSubcategories={allSubcategories}
        allRegions={allRegions}
        topCompanies={topCompanies}
        mode="rows"
      />
      <Suspense fallback={<LoadingSpinner>Loading jobs...</LoadingSpinner>}>
        <HotJobs
          jobs={jobs}
          topTags={topTags}
          loadMoreJobs={loadMoreJobs}
          hasMore={hasMore}
          filters={filters}
          onFilter={onFilter}
        />
      </Suspense>
    </HomeContainer>
  );
};

export default Home;