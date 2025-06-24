import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Home from '@/components/home/Home';
import FilterPanel from '@/components/filters/FilterPanel';
import JobDetails from '@/components/jobs/JobDetails';
import Diagnostics from '@/components/diagnostics/Diagnostics';
import { JobsService } from '@/logic/api';
import { FilterState, RankedItem } from '@/types/filter';
import { Job, Tag } from '@/types/job';
import { computeFrequencies } from '@/utils/frequencies';
import { filterJobs } from '@/logic/filterUtils';
import './App.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--background, #f5f5f5);
  font-family: 'Poppins', sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: var(--text, #333);
`;

const App: React.FC = () => {
  console.log('App component mounted');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allCategories, setAllCategories] = useState<RankedItem[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<RankedItem[]>([]);
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
    sortMode: 'latest',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<{ name: string; passed: boolean }[]>([]);
  const jobsPerPage = 60;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedJobs = await JobsService.fetchJobs(1, 100);
        setJobs(fetchedJobs);
        const frequencies = computeFrequencies(fetchedJobs);
        setAllTags(frequencies.tags);
        setAllCategories(frequencies.categories);
        setAllSubcategories(frequencies.subcategories);
        setAllRegions(frequencies.regions);
        setTopCompanies(frequencies.companies);
      } catch (err: any) {
        setError(`Error al cargar datos: ${err.message || 'Desconocido'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topTags = allTags.slice(0, 10).map((tag) => tag.tag);
  const filteredJobs = filterJobs(jobs, filters).slice(0, currentPage * jobsPerPage);
  const hasMore = filteredJobs.length < filterJobs(jobs, filters).length;

  const handleFilter = (newFilters: Partial<FilterState>) => {
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
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
      sortMode: 'latest',
    });
    setCurrentPage(1);
  };

  const loadMoreJobs = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (loading) return <LoadingContainer>Cargando empleos...</LoadingContainer>;
  if (error) return <LoadingContainer>{error}</LoadingContainer>;

  return (
    <AppContainer>
      <Header
        filters={filters}
        onFilter={handleFilter}
        allTags={allTags}
        allCategories={allCategories}
        allSubcategories={allSubcategories}
        allRegions={allRegions}
        topCompanies={topCompanies}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              filters={filters}
              onFilter={handleFilter}
              onReset={resetFilters}
              allTags={allTags}
              allCategories={allCategories}
              allSubcategories={allSubcategories}
              allRegions={allRegions}
              topCompanies={topCompanies}
              jobs={filteredJobs}
              topTags={topTags}
              loadMoreJobs={loadMoreJobs}
              hasMore={hasMore}
            />
          }
        />
        <Route
          path="/filters"
          element={
            <FilterPanel
              filters={filters}
              onFilter={handleFilter}
              onReset={resetFilters}
              allTags={allTags}
              allCategories={allCategories}
              allSubcategories={allSubcategories}
              allRegions={allRegions}
              topCompanies={topCompanies}
              mode="tabs"
              jobs={filteredJobs}
              topTags={topTags}
              loadMoreJobs={loadMoreJobs}
              hasMore={hasMore}
            />
          }
        />
        <Route path="/job/:id" element={<JobDetails jobs={jobs} />} />
      </Routes>
      <Footer />
      <Diagnostics onComplete={(results: { name: string; passed: boolean }[]) => setDiagnosticResults(results)} />
      <div>¡Prueba de carga!</div>
      {diagnosticResults.length > 0 && (
        <div style={{ position: 'fixed', bottom: '50px', left: '10px', background: '#fff', padding: '10px', border: '1px solid #000' }}>
          <h3>Resultados de Diagnóstico</h3>
          <ul>
            {diagnosticResults.map((result, idx) => (
              <li key={idx}>{result.name}: {result.passed ? 'Pasó' : 'Falló'}</li>
            ))}
          </ul>
        </div>
      )}
    </AppContainer>
  );
};

export default App;