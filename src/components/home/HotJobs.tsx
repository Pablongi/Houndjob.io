import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FilterState, Job } from '../../types/job'; // Corregido
import { filterJobs } from '../../logic/filterUtils';
import JobCard from '../jobs/JobCard';

const ListContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 15px auto;
  padding: 8px 16px;
  background: var(--primary, #007bff);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: var(--primary-hover, #0056b3);
  }
  &:disabled {
    background: var(--disabled, #cccccc);
    cursor: not-allowed;
  }
`;

const NoJobsMessage = styled.p`
  text-align: center;
  font-size: 16px;
  color: var(--text-light, #666);
  margin: 30px 0;
`;

interface HotJobsProps {
  jobs: Job[];
  topTags: string[];
  loadMoreJobs: () => void;
  hasMore: boolean;
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
}

const HotJobs: React.FC<HotJobsProps> = ({ jobs, topTags, loadMoreJobs, hasMore, filters, onFilter }) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreJobs();
        }
      },
      { rootMargin: '100px' }
    );

    if (listRef.current) {
      observer.observe(listRef.current);
    }

    return () => {
      if (listRef.current) {
        observer.unobserve(listRef.current);
      }
    };
  }, [hasMore, loadMoreJobs]);

  const filteredJobs = filterJobs(jobs, filters).slice(-50);

  if (filteredJobs.length === 0) {
    return (
      <ListContainer>
        <NoJobsMessage>No jobs found. Try adjusting your filters.</NoJobsMessage>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <JobsGrid>
        <List ref={listRef}>
          {filteredJobs.map((job: Job) => ( // Tipado explícito
            <li key={job.id}>
              <Link to={`/job/${job.id}`} style={{ textDecoration: 'none' }}>
                <JobCard job={job} topTags={topTags} filters={filters} onFilter={onFilter} />
              </Link>
            </li>
          ))}
        </List>
      </JobsGrid>
      {hasMore && (
        <LoadMoreButton onClick={loadMoreJobs} disabled={!hasMore}>
          Load More
        </LoadMoreButton>
      )}
    </ListContainer>
  );
};

export default HotJobs;