import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Job } from '../types/Job';
import JobsService from '../service/JobsService';
import { Fade } from 'react-awesome-reveal';
import { motion } from 'framer-motion';

const ZoneContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled(motion.h2)`
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #00c1de;
  position: relative;
  @media (max-width: 768px) {
    font-size: 1.3em;
  }
`;

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const JobCard = styled(motion.div)`
  background: #fff;
  border: 1px solid #e8ecef;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  height: 200px;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 193, 222, 0.2);
  }
  @media (max-width: 768px) {
    height: auto;
    padding: 10px;
  }
`;

const JobHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CompanyLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #f5f5f5;
  border: 1px solid #e8ecef;
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
  }
`;

const JobInfo = styled.div`
  flex: 1;
`;

const JobTitle = styled.a`
  font-size: 15px;
  font-weight: 600;
  color: #00c1de;
  text-decoration: none;
  transition: color 0.2s ease;
  &:hover {
    color: #00a1be;
  }
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Company = styled.p`
  color: #666;
  margin: 2px 0;
  font-size: 13px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const PortalLogo = styled.a`
  display: block;
  width: 70px;
  height: 20px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 2px 0;
  text-decoration: none;
  &.bne {
    background-image: url('/Logo-BNE-slogan-1.png');
  }
  &.getonboard {
    background-image: url('/icon-new-c18debbaa69bac8df6158426f4a00752b32a7fba603cba4eeb3e4572466344a6.png');
  }
  &:hover {
    opacity: 0.9;
  }
  @media (max-width: 768px) {
    width: 60px;
    height: 18px;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const Tag = styled(motion.span)`
  background: #f0f0f0;
  color: #333;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #e0e0e0;
  }
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 2px 6px;
  }
`;

const TimeLinkContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const TimeButton = styled(motion.button)`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: default;
  background: #f5f5f5;
  color: #666;
  border: none;
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

const LinkButton = styled(motion.a)`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  background: #00c1de;
  color: white;
  text-decoration: none;
  transition: background 0.2s ease;
  &:hover {
    background: #00a1be;
  }
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 8px;
  }
`;

const EmptyMessage = styled.p`
  font-size: 1.1em;
  color: #666;
  text-align: center;
  padding: 20px;
  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const Pagination = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const PageButton = styled(motion.button)`
  padding: 8px 16px;
  background: #00c1de;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: #00a1be;
  }
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9em;
  }
`;

interface LastJobsProps {
  jobs: Job[];
  page: number;
  perPage: number;
  totalJobs: number;
  onPageChange: (page: number) => void;
  onTagFilter: (tag: string) => void;
}

const LastJobs: React.FC<LastJobsProps> = ({ jobs, page, perPage, totalJobs, onPageChange, onTagFilter }) => {
  const [jobsWithLogos, setJobsWithLogos] = useState<Job[]>(jobs);

  useEffect(() => {
    setJobsWithLogos(jobs); // Usamos los logos directamente de la API
  }, [jobs]);

  const totalPages = Math.ceil(totalJobs / perPage);

  return (
    <ZoneContainer className="animate__animated animate__fadeIn">
      <Title
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Latest Jobs
      </Title>
      {jobs.length > 0 ? (
        <JobGrid>
          {jobsWithLogos.map((job, index) => {
            console.log(`Rendering job ${job.title}:`, { tags: job.tags, publicUrl: job.publicUrl, companyLogo: job.companyLogo }); // Depuración
            return (
              <Fade
                key={job.id}
                direction="up"
                triggerOnce
                delay={index * 100}
              >
                <JobCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ boxShadow: '0 4px 12px rgba(0, 193, 222, 0.3)' }}
                >
                  <JobHeader>
                    {job.companyLogo && <CompanyLogo src={job.companyLogo} alt={`${job.company} logo`} />}
                    <JobInfo>
                      <JobTitle href={job.publicUrl} target="_blank" rel="noopener noreferrer">{job.title}</JobTitle>
                      <Company>{job.company}</Company>
                      <PortalLogo
                        href={job.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={job.portal.toLowerCase() === 'bne.cl' ? 'bne' : 'getonboard'}
                      />
                    </JobInfo>
                  </JobHeader>
                  <TagsContainer>
                    {job.tags.length > 0 ? (
                      job.tags.map((tag: string, idx: number) => (
                        <Tag
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onTagFilter(tag)}
                        >
                          #{tag}
                        </Tag>
                      ))
                    ) : (
                      <span>No tags available</span>
                    )}
                  </TagsContainer>
                  <TimeLinkContainer>
                    <TimeButton>{JobsService.formatPublishedDate(job.published, job.portal)}</TimeButton>
                    <LinkButton
                      href={job.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                    >
                      Ver más
                    </LinkButton>
                  </TimeLinkContainer>
                </JobCard>
              </Fade>
            );
          })}
        </JobGrid>
      ) : (
        <EmptyMessage className="animate__animated animate__fadeIn">
          No jobs available.
        </EmptyMessage>
      )}
      <Pagination
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <PageButton
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Previous
        </PageButton>
        <span style={{ padding: '8px 16px', color: '#666' }}>
          Page {page} of {totalPages}
        </span>
        <PageButton
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Next
        </PageButton>
      </Pagination>
    </ZoneContainer>
  );
};

export default LastJobs;