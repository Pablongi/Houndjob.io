import React from 'react';
import styled from 'styled-components';
import { FilterState } from '../../types/filter';
import { Job } from '../../types/job';

const Card = styled.div`
  background: var(--background-panel, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
  }
`;

const Title = styled.h3`
  font-size: 18px;
  color: var(--text, #333);
  margin-bottom: 10px;
`;

const Meta = styled.p`
  font-size: 14px;
  color: var(--text-light, #666);
  margin-bottom: 5px;
`;

const Description = styled.p`
  font-size: 14px;
  color: var(--text, #333);
  margin-bottom: 10px;
`;

interface JobCardProps {
  job: Job;
  topTags: string[];
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, topTags, filters, onFilter }) => {
  const handleTagClick = (tag: string) => {
    const updatedTags = new Set(filters.selectedTags);
    updatedTags.add(tag);
    onFilter({ selectedTags: updatedTags });
  };

  return (
    <Card>
      <Title>{job.attributes.title}</Title>
      <Meta>Company: {job.attributes.company}</Meta>
      <Meta>Portal: {job.attributes.portal}</Meta>
      <Description>{job.description.substring(0, 100)}...</Description>
      {job.tags.filter(tag => topTags.includes(tag.tag)).map(tag => (
        <span
          key={tag.tag}
          onClick={() => handleTagClick(tag.tag)}
          style={{ cursor: 'pointer', color: '#00c4b4', marginRight: '5px' }}
        >
          #{tag.tag}
        </span>
      ))}
    </Card>
  );
};

export default JobCard;