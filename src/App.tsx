import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import JobSearch from './components/JobSearch';
import LastJobs from './components/LastJobs';
import HeaderFooter from './components/HeaderFooter';
import JobsService from './service/JobsService';
import { Job } from './types/Job';
import 'animate.css';
import { motion } from 'framer-motion';
import 'animate.css/animate.min.css';
import './global.css';

interface FilterState {
  search: string;
  tags: Set<string>;
}

const MainContent = styled.main`
  min-height: calc(100vh - 140px);
  padding: 20px;
  background: #f5f5f5;
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 1.2em;
  color: #00c1de;
  position: relative;
  &::before {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #00c1de;
    border-top: 4px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    position: absolute;
    left: -50px;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: new Set(),
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 40;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const fetchedJobs = await JobsService.getJobs();
      setJobs(fetchedJobs.data);
      setFilteredJobs(fetchedJobs.data);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    const filtered = jobs.filter((job: Job) => {
      const matchesSearch = newFilters.search
        ? job.title.toLowerCase().includes(newFilters.search.toLowerCase()) ||
          job.company.toLowerCase().includes(newFilters.search.toLowerCase())
        : true;
      const matchesTags = newFilters.tags.size
        ? job.tags.some((tag) => newFilters.tags.has(tag))
        : true;
      return matchesSearch && matchesTags;
    });
    setFilteredJobs(filtered);
    setPage(1);
  };

  const handleTagFilter = (tag: string) => {
    const newTags = new Set(filters.tags);
    if (newTags.has(tag)) newTags.delete(tag);
    else newTags.add(tag);
    applyFilters({ ...filters, tags: newTags });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      tags: new Set(),
    });
    setFilteredJobs(jobs);
    setPage(1);
  };

  const paginatedJobs = filteredJobs.slice((page - 1) * perPage, page * perPage);
  const totalJobs = filteredJobs.length;

  return (
    <div>
      <HeaderFooter onReset={resetFilters} />
      <MainContent>
        {loading ? (
          <LoadingSpinner
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="animate__animated animate__rotateIn animate__pulse"
          >
            Loading jobs...
          </LoadingSpinner>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <JobSearch
                jobs={jobs}
                onFilter={applyFilters}
                activeFilters={filters}
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LastJobs
                jobs={paginatedJobs}
                page={page}
                perPage={perPage}
                totalJobs={totalJobs}
                onPageChange={setPage}
                onTagFilter={handleTagFilter}
              />
            </motion.div>
          </motion.div>
        )}
      </MainContent>
      <HeaderFooter isFooter />
    </div>
  );
};

export default App;