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
import { supabase } from '@/supabase';
import { useState, useEffect } from 'react';

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

const AppContent = () => {
  console.log('App rendering');  // Added debug log

  const { jobs, loadMoreJobs, hasMore, loading, error, refetch } = useJobs();
  const { filters, setFilters, user, setUser } = useAppContext();
  const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) console.error('[Diagnostic] Auth error:', error);
    } catch (e) {
      console.error('[Diagnostic] SignIn error:', e);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('[Diagnostic] SignOut error:', error);
    } catch (e) {
      console.error('[Diagnostic] SignOut error:', e);
    }
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme(theme);
    };
    mediaQuery.addEventListener('change', handleChange);
    applyTheme(theme);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    // Realtime notifs for new jobs
    const channel = supabase
      .channel('job_offers_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'job_offers' }, (payload: { new: { title: string } }) => {
        alert(`Nuevo job: ${payload.new.title}`);  // Simple notif
        refetch();  // Refresh jobs
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refetch]);

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
    setTheme((prev: 'light' | 'dark' | 'system') => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      selectedCategories: new Set<string>(),
      selectedSubcategories: new Set<string>(),
      selectedTags: new Set<string>(),
      selectedPortals: new Set<string>(),
      selectedCountries: new Set<string>(),
      selectedRegions: new Set<string>(),
      company: '',
      selectedJobTitles: new Set<string>(),
      selectedModalities: new Set<string>(),
      selectedExperiences: new Set<string>(),
    });
    refetch();
  };

  const handleFilter = (newFilters: Partial<FilterState>) => {
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }));
    refetch();
  };

  return (
    <AppContainer>
      <Header toggleTheme={toggleTheme} currentTheme={theme} user={user} signInWithGoogle={signInWithGoogle} signOut={signOut} />
      <MainContent>
        <LayoutWrapper>
          <SearchBox>
            <SearchBar allJobs={jobs} />
          </SearchBox>
          <FiltersBox $minimized={isFiltersMinimized}>
            <FiltersPanel allJobs={jobs} onMinimize={(min: boolean) => setIsFiltersMinimized(min)} isMinimized={isFiltersMinimized} />
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

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;