import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import JobCard from './JobCard';
import { Job } from 'types/job';

const JobListContainer = styled.div`
  max-width: 1200px; /* Match search bar width */
  margin: 15px auto; /* Center the container */
  padding: 0 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 15px;
`;

const LoadingSentinel = styled.div`
  height: 20px;
`;

interface JobListProps {
  jobs: Job[];
  topTags: string[];
  loadMoreJobs: () => void;
  hasMore: boolean;
}

const JobList: React.FC<JobListProps> = ({ jobs, topTags, loadMoreJobs, hasMore }) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreJobs();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [loadMoreJobs, hasMore]);

  return (
    <JobListContainer>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} topTags={topTags} />
      ))}
      {hasMore && <LoadingSentinel ref={sentinelRef} />}
    </JobListContainer>
  );
};

export default JobList;