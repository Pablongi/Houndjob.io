import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Job, Tag } from 'types/job';
import { extractRegionFromDescription } from 'utils/filterUtils';

const Card = styled(motion.div)`
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 1px solid var(--zhipin-border);
  border-radius: 8px;
  padding: 8px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  position: relative;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 193, 222, 0.2);
    transform: translateY(-2px);
  }
  @media (max-width: 768px) {
    min-height: 120px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 4px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  &.today {
    background-color: #ff4d4f;
  }
  &.new {
    background-color: #1890ff;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const LogoContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const Logo = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  background: #f5f5f5;
  border: 1px solid var(--zhipin-border);
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
  }
`;

const PortalLogo = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: contain;
`;

const Info = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Title = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: var(--zhipin-teal);
  text-decoration: none;
  transition: color 0.2s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    color: var(--zhipin-teal-dark);
  }
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const Details = styled.div`
  font-size: 10px;
  color: var(--zhipin-text-light);
  margin: 2px 0;
  background: rgba(245, 245, 245, 0.5);
  padding: 2px 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 768px) {
    font-size: 9px;
  }
`;

const CountryFlag = styled.img`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  object-fit: cover;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 4px;
`;

interface JobTagProps {
  isTopTag?: boolean;
}

const JobTag = styled(motion.span)<JobTagProps>`
  background: ${({ isTopTag }) => (isTopTag ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#f0f0f0')};
  color: ${({ isTopTag }) => (isTopTag ? '#fff' : 'var(--zhipin-text)')};
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid ${({ isTopTag }) => (isTopTag ? '#DAA520' : 'var(--zhipin-border)')};
  cursor: pointer;
  transition: background 0.2s ease;
  box-shadow: ${({ isTopTag }) => (isTopTag ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none')};
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:hover {
    background: ${({ isTopTag }) => (isTopTag ? 'linear-gradient(135deg, #FFC107, #FF8C00)' : '#e0e0e0')};
  }
  @media (max-width: 768px) {
    font-size: 8px;
    padding: 1px 3px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  gap: 4px;
`;

const Time = styled(motion.span)`
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 4px;
  background: #f5f5f5;
  color: var(--zhipin-text-light);
  @media (max-width: 768px) {
    font-size: 8px;
    padding: 1px 3px;
  }
`;

const ApplyButton = styled(motion.a)`
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--zhipin-teal);
  color: #fff;
  text-decoration: none;
  transition: background 0.2s ease;
  &:hover {
    background: var(--zhipin-teal-dark);
  }
  @media (max-width: 768px) {
    font-size: 8px;
    padding: 1px 5px;
  }
`;

const portalLogos: { [key: string]: string } = {
  'Get On Board': '/icon-new-c18debbaa69bac8df6158426f4a00752b32a7fba603cba4eeb3e4572466344a6.png',
  'BNE.cl': '/Logo-BNE-slogan-1.png',
};

const countryFlags: { [key: string]: string } = {
  'Chile': '/chile_flag.png',
  'Argentina': '/argentina_flag.png',
  'Colombia': '/colombia_flag.png',
  'Peru': '/peru_flag.png',
  'Mexico': '/mexico_flag.png',
  'Remote': '/remote.png',
};

interface JobCardProps {
  job: Job;
  topTags: string[];
}

const JobCard: React.FC<JobCardProps> = ({ job, topTags }) => {
  const getTimeAgo = (date: string): string => {
    const creationDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - creationDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  };

  const timeAgo = getTimeAgo(job.attributes.creation_date);
  const diffDays = Math.floor((new Date().getTime() - new Date(job.attributes.creation_date).getTime()) / (1000 * 60 * 60 * 24));
  const region = job.attributes.portal === 'BNE.cl' ? (job.attributes.region || extractRegionFromDescription(job.description)) : null;

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {diffDays === 0 && <Badge className="today">TODAY!</Badge>}
      {diffDays > 0 && diffDays <= 3 && <Badge className="new">NEW!</Badge>}
      <Header>
        <LogoContainer>
          <Logo src={job.attributes.logo_url} alt={`${job.attributes.company} logo`} onError={(e) => (e.currentTarget.style.display = 'none')} />
          {portalLogos[job.attributes.portal] && <PortalLogo src={portalLogos[job.attributes.portal]} alt={`${job.attributes.portal} logo`} onError={(e) => (e.currentTarget.style.display = 'none')} />}
        </LogoContainer>
        <Info>
          <Title href={job.publicUrl} target="_blank" rel="noopener noreferrer">
            {job.attributes.title}
          </Title>
          <Details>
            <CountryFlag src={countryFlags[job.attributes.country] || '/default_flag.png'} alt={`${job.attributes.country} flag`} onError={(e) => (e.currentTarget.style.display = 'none')} />
            {job.attributes.company} - {job.attributes.country}
            {job.attributes.portal === 'BNE.cl' && region && `, ${region}`}
            {job.attributes.portal === 'Get On Board' && job.jobType && ` (${job.jobType})`}
          </Details>
        </Info>
      </Header>
      <Tags>
        {job.tags.slice(0, 5).map((tag: Tag, idx: number) => (
          <JobTag
            key={idx}
            isTopTag={topTags.includes(tag.tag)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            #{tag.tag}
          </JobTag>
        ))}
      </Tags>
      <Footer>
        <Time>{timeAgo}</Time>
        <ApplyButton href={job.publicUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }}>
          Aplicar
        </ApplyButton>
      </Footer>
    </Card>
  );
};

export default JobCard;