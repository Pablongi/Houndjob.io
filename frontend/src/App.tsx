// /frontend/src/App.tsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { AppProvider, useAppContext } from '@/components/filters/FilterContext';
import JobList from '@/components/jobs/JobList';
import SearchBar from '@/components/filters/SearchBar';
import FiltersPanel from '@/components/filters/FiltersPanel';
import SelectedFilters from '@/components/filters/SelectedFilters';

// ←←← NUEVOS IMPORTS PARA LAS NUEVAS PÁGINAS
import Favorites from '@/pages/Favorites';
import Profile from '@/pages/Profile';

import { useJobsWithCache as useJobs } from '@/hooks/useJobsWithCache';
import { FilterState } from '@/types/filter';
import { supabase } from '@/supabase';
import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

// ==================== CALLBACK CORREGIDO CON IIFE (SIN ERROR TS) ====================
const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 Callback montado - Intentando recuperar sesión...');

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      
      console.log('📡 getSession() resultado:', { 
        hasSession: !!data.session, 
        user: data.session?.user?.email || 'null',
        error: error?.message 
      });

      if (data.session) {
        console.log('✅ SESIÓN RECUPERADA CORRECTAMENTE - Usuario:', data.session.user.email);
        navigate('/', { replace: true });
        return;
      }

      console.log('⚠️ No hay sesión inmediata, reintentando...');
      const { data: retryData } = await supabase.auth.refreshSession();
      
      if (retryData.session) {
        console.log('✅ SESIÓN RECUPERADA EN RETRY');
        navigate('/', { replace: true });
      } else {
        console.log('❌ Falló incluso el retry');
        navigate('/', { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div style={{ padding: '80px 20px', textAlign: 'center', fontSize: '18px', color: '#09BB07' }}>
      Procesando login con Google...<br />
      <small>Por favor espera 2-3 segundos</small>
    </div>
  );
};
// =====================================================================

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
  const { jobs, loadMoreJobs, hasMore, loading, error, refetch } = useJobs();
  const { filters, setFilters, user } = useAppContext();
  const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );

  useEffect(() => {
    console.log('👤 Estado de usuario actual en AppContent:', user?.email || 'NINGUNO');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme(theme);
    mediaQuery.addEventListener('change', handleChange);
    applyTheme(theme);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    const channel = supabase
      .channel('job_offers_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'job_offers' },
        (payload) => {
          console.log('📨 Nuevo empleo recibido:', payload.new.title);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const effective = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', effective);
  };

  // Dentro de AppContent
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
    selectedSalary: new Set<string>(),     // ←←← ESTO FALTABA
  });
  refetch();
};

  const handleFilter = (newFilters: Partial<FilterState>) => {
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }));
    refetch();
  };

  return (
    <AppContainer>
      <Header />
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
            <JobList jobs={jobs} loadMoreJobs={loadMoreJobs} hasMore={hasMore} loading={loading} error={error} />
          </JobsBox>
        </LayoutWrapper>
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

const App = () => (
  <AppProvider>
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/auth/callback" element={<Callback />} />

      {/* ←←← NUEVAS RUTAS AGREGADAS */}
      <Route path="/favoritos" element={<Favorites />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/terminos" element={<div className="p-12 prose mx-auto max-w-3xl"><h1>Términos y Condiciones</h1><p>Texto legal aquí...</p></div>} />
      <Route path="/privacidad" element={<div className="p-12 prose mx-auto max-w-3xl"><h1>Política de Privacidad</h1><p>Texto legal aquí...</p></div>} />
    </Routes>
  </AppProvider>
);

export default App;