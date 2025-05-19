import React, { useState, useEffect } from 'react';
import HeaderFooter from './components/HeaderFooter';
import LastJobs from './components/LastJobs';
import JobSearch from './components/JobSearch';
import JobsService from './service/JobsService';
import { Job } from './types/Job';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #d32f2f;
  font-size: 1.2em;
`;

interface FilterState {
  search: string;
  tags: Set<string>;
  company: string | null;
  portal: string | null;
}

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(10);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: new Set(),
    company: null,
    portal: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setError(null);
        const response = await JobsService.getJobs();
        setJobs(response.data);
        setFilteredJobs(response.data);
        setTotalJobs(response.total);
      } catch (err: any) {
        console.error('Failed to load jobs:', err);
        setError('Failed to load jobs. Please try again later.');
        setJobs([]);
        setFilteredJobs([]);
        setTotalJobs(0);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let result = [...jobs];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(
          (job) =>
            job.title.toLowerCase().includes(searchLower) ||
            job.company.toLowerCase().includes(searchLower)
        );
      }

      if (filters.tags.size > 0) {
        result = result.filter((job) =>
          Array.from(filters.tags).every((tag) => job.tags.includes(tag))
        );
      }

      if (filters.company) {
        result = result.filter((job) => job.company === filters.company);
      }

      if (filters.portal) {
        result = result.filter((job) => job.portal === filters.portal);
      }

      setFilteredJobs(result);
      setTotalJobs(result.length);
      setPage(1);
    };
    applyFilters();
  }, [filters, jobs]);

  const handleFilter = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleTagFilter = (tag: string) => {
    const newTags = new Set(filters.tags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setFilters({ ...filters, tags: newTags, company: null, portal: null });
  };

  const handleReset = () => {
    setFilters({
      search: '',
      tags: new Set(),
      company: null,
      portal: null,
    });
    setPage(1);
  };

  const paginatedJobs = filteredJobs.slice((page - 1) * perPage, page * perPage);

  return (
    <AppContainer>
      <HeaderFooter onReset={handleReset} />
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <>
          <JobSearch jobs={jobs} onFilter={handleFilter} activeFilters={filters} />
          <LastJobs
            jobs={paginatedJobs}
            page={page}
            perPage={perPage}
            totalJobs={totalJobs}
            onPageChange={handlePageChange}
            onTagFilter={handleTagFilter}
          />
        </>
      )}
      <HeaderFooter isFooter={true} />
    </AppContainer>
  );
};

export default App;