import { useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '@/components/filters/FilterContext';
import { filterJobs } from '@/logic/filterUtils';
import JobCard from './JobCard';
import styled from 'styled-components';
import { Job } from '@/types/job';
import Loading from '@/components/common/Loading';

const JobsGrid = styled.div`
  display: grid;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  grid-template-columns: repeat(1, minmax(250px, 1fr));
  @media (min-width: 600px) {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
  }
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(250px, 1fr));
  }
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, minmax(250px, 1fr));
  }
  max-width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 200px;
  width: 100%;
  padding-top: 20px;
`;

const LogoSpin = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingMore = styled.div`
  text-align: center;
  padding: 16px;
  color: var(--text-light);
`;

const NoResultsMessage = styled.p`
  text-align: center;
  color: var(--text-light);
  font-size: 14px;
  margin: 16px 0;
`;

interface JobListProps {
  jobs: Job[];
  loadMoreJobs: () => void;
  hasMore: boolean | undefined;
  loading: boolean;
  error: unknown;
}

const JobList = ({ jobs, loadMoreJobs, hasMore, loading, error }: JobListProps) => {
  const { filters } = useAppContext();

  const filteredJobs = useMemo(() => {
    let result = filterJobs(jobs, filters);
    result.sort((a: Job, b: Job) => 
      new Date(b.attributes.creation_date).getTime() - new Date(a.attributes.creation_date).getTime()
    );
    return result;
  }, [jobs, filters]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreJobs();
        }
      },
      { threshold: 0.5, rootMargin: '200px' }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
    };
  }, [hasMore, loading, loadMoreJobs]);

  if (error) {
    return (
      <p style={{ color: 'var(--accent-red)', textAlign: 'center' }} aria-live="assertive">
        Error al cargar empleos: {String(error)}
      </p>
    );
  }

  if (jobs.length === 0 && loading) {
    return (
      <LoadingContainer>
        <LogoSpin src="/logos/Houndjob_logo.png" alt="Cargando HoundJob" />
      </LoadingContainer>
    );
  }

  if (filteredJobs.length === 0) {
    return <NoResultsMessage aria-live="polite">No se encontraron empleos.</NoResultsMessage>;
  }

  return (
    <>
      <JobsGrid role="list">
        {filteredJobs.map((job: Job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </JobsGrid>
      {hasMore && (
        <LoadingMore ref={bottomRef}>
          {loading ? 'Cargando más...' : 'Desplázate para cargar más'}
        </LoadingMore>
      )}
    </>
  );
};

export default JobList;