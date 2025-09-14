import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { AppProvider, useAppContext } from '@/components/filters/FilterContext';
import JobList from '@/components/jobs/JobList';
import SearchBar from '@/components/filters/SearchBar';
import FiltersPanel from '@/components/filters/FiltersPanel';
import { useJobsWithCache as useJobs } from '@/hooks/useJobsWithCache';
import SelectedFilters from '@/components/filters/SelectedFilters';
import { FilterState } from '@/types/filter';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-secondary);
  width: 100%;
  box-sizing: border-box;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 0;
  max-width: 100%;
  overflow: visible;
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 auto;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
`;

const SearchBox = styled.div`
  background: var(--background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 16px;
  width: 50vw;
  margin: 16px auto 0 auto;
  @media (max-width: 768px) {
    width: 100vw;
    padding: 8px;
  }
  @media (max-width: 1024px) {
    width: 70vw;
  }
`;

const FiltersBox = styled.div<{ $minimized: boolean }>`
  background: var(--background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 16px;
  width: 70vw;
  max-width: 70vw;
  margin: 0 auto;
  height: ${({ $minimized }) => ($minimized ? 'auto' : 'fit-content')};
  overflow: visible;
  transition: height 0.3s ease, opacity 0.3s ease;
  opacity: ${({ $minimized }) => ($minimized ? 0.5 : 1)};
  @media (max-width: 768px) {
    width: 100vw;
    max-width: 100vw;
    padding: 8px;
  }
  @media (max-width: 1024px) {
    width: 70vw;
    max-width: 70vw;
  }
`;

const JobsBox = styled.div`
  background: var(--background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 16px;
  width: 90vw;
  max-width: 90vw;
  margin: 0 auto;
  overflow: visible;
  @media (max-width: 768px) {
    padding: 8px;
    width: 100vw;
    max-width: 100vw;
  }
  @media (max-width: 1024px) {
    width: 90vw;
    max-width: 90vw;
  }
`;

const FloatingBar = styled.div`
  position: sticky;
  top: 60px;
  background: var(--background);
  padding: 8px;
  z-index: 10;
  box-shadow: var(--shadow);
  width: 70vw;
  margin: 0 auto;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClearAllButton = styled.button`
  background: var(--chip-bg);
  border: none;
  border-radius: 16px;
  color: var(--accent-red);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  &:hover {
    background: #ffd0d0;
  }
`;

const AppContent: React.FC = () => {
  const { jobs, loadMoreJobs, hasMore, loading, error, refetch } = useJobs();
  const { filters, setFilters } = useAppContext();
  const [isFiltersMinimized, setIsFiltersMinimized] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme(theme);
    };
    mediaQuery.addEventListener('change', handleChange);
    applyTheme(theme);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    let effectiveTheme: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      selectedCategories: new Set(),
      selectedSubcategories: new Set(),
      selectedTags: new Set(),
      selectedPortals: new Set(),
      selectedCountries: new Set(),
      selectedRegions: new Set(),
      company: '',
      selectedJobTitles: new Set(),
      selectedModalities: new Set(),
      selectedExperiences: new Set(),
    });
    refetch();
  };

  const handleFilter = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    refetch();
  };

  return (
    <AppContainer>
      <Header toggleTheme={toggleTheme} currentTheme={theme} />
      <MainContent>
        <LayoutWrapper>
          <SearchBox>
            <SearchBar allJobs={jobs} />
          </SearchBox>
          <FiltersBox $minimized={isFiltersMinimized}>
            <FiltersPanel allJobs={jobs} onMinimize={(min) => setIsFiltersMinimized(min)} isMinimized={isFiltersMinimized} />
          </FiltersBox>
          {isFiltersMinimized && (
            <FloatingBar>
              <SelectedFilters filters={filters} onFilter={handleFilter} />
              <ClearAllButton onClick={resetFilters}>Limpiar todos</ClearAllButton>
            </FloatingBar>
          )}
          <JobsBox>
            <Routes>
              <Route path="/" element={<JobList jobs={jobs} loadMoreJobs={loadMoreJobs} hasMore={hasMore} loading={loading} error={error} />} />
            </Routes>
          </JobsBox>
        </LayoutWrapper>
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;