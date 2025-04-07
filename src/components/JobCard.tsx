/* eslint-disable react/jsx-no-undef */ // Desactiva temporalmente la regla para este archivo

import React, { useState } from 'react';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaShareAlt, FaClock, FaGlobe, FaHeart, FaBookmark, FaMoneyBillWave } from 'react-icons/fa';
import { Job } from '../types/Job';

const Card = styled.div`
  width: 100%;
  max-width: 315px;
  height: 140px;
  padding: 10px;
  background: var(--white);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  position: relative;
  &:hover {
    background: #F5F5F5;
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
`;

const CompanyLogo = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  object-fit: contain;
`;

const LogoPlaceholder = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
`;

const JobInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
`;

const JobTitle = styled.button`
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  line-height: 1.2;
  &:hover {
    color: #1E90FF;
    text-decoration: underline;
  }
`;

const CompanyName = styled.p`
  color: #666;
  font-size: 12px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  justify-content: space-between;
`;

const DetailsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const WorkDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 9px;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Salary = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #F4D03F;
  font-size: 9px;
  font-weight: 500;
  white-space: nowrap;
`;

const Published = styled.div`
  color: #666;
  font-size: 9px;
  white-space: nowrap;
`;

const PortalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
`;

const PortalLogo = styled.img`
  width: 14px;
  height: 14px;
  object-fit: contain;
`;

const Perks = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
`;

const PerkBadge = styled.span`
  background: #1E90FF;
  color: var(--white);
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 10px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  flex: 0 0 auto;
`;

const SaveButton = styled.button`
  background: transparent;
  color: #333;
  border: 1px solid #E6E6E6;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.3s, transform 0.2s, color 0.3s;
  &:hover {
    background: #1E90FF;
    color: #fff;
    transform: scale(1.05);
  }
`;

const InterestedButton = styled.button`
  background: transparent;
  color: #333;
  border: 1px solid #E6E6E6;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.3s, transform 0.2s, color 0.3s;
  &:hover {
    background: #1E90FF;
    color: #fff;
    transform: scale(1.05);
  }
`;

const ShareButton = styled.button`
  background: transparent;
  color: #333;
  border: 1px solid #E6E6E6;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.3s, transform 0.2s, color 0.3s;
  &:hover {
    background: #1E90FF;
    color: #fff;
    transform: scale(1.05);
  }
`;

const LinkButton = styled.button`
  background: #1E90FF;
  color: #fff;
  border: none;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  &:hover {
    background: #63B3ED;
    transform: scale(1.05);
  }
`;

interface JobCardProps {
  onApply: () => void;
  onSave: () => void;
  isSaved: boolean;
}

const JobCard: React.FC<Job & JobCardProps> = (props) => {
  const {
    title,
    company,
    companyLogo,
    modality,
    remoteStatus,
    location,
    published,
    portal,
    publicUrl,
    onApply,
    onSave,
    isSaved,
    interestedCount,
    salary,
    perks,
  } = props;

  const [interested, setInterested] = useState<number>(interestedCount);
  const [isInterested, setIsInterested] = useState<boolean>(false);
  const [shareClicked, setShareClicked] = useState<boolean>(false);

  const timeSincePublished = (): string => {
    if (!published) return 'N/A';
    const diff = Math.floor((Date.now() - published * 1000) / (1000 * 60));
    if (diff < 60) return `${diff} min`;
    if (diff < 1440) return `${Math.floor(diff / 60)} h`;
    return `${Math.floor(diff / 1440)} d`;
  };

  const handleInterested = () => {
    setInterested((prev) => prev + 1);
    setIsInterested(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(publicUrl);
    setShareClicked(true);
    setTimeout(() => setShareClicked(false), 2000);
  };

  const safeCompany = typeof company === 'string' && company ? company : 'Unknown';
  const logoUrl = companyLogo || `https://logo.clearbit.com/${safeCompany.toLowerCase().replace(/\s+/g, '')}.com?size=80`;

  return (
    <Card>
      <TopSection>
        {logoUrl ? (
          <CompanyLogo
            src={logoUrl}
            alt={`${safeCompany} logo`}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <LogoPlaceholder>{safeCompany[0]}</LogoPlaceholder>
        )}
        <JobInfo>
          <JobTitle
            onClick={(e) => {
              e.preventDefault();
              onApply();
              window.open(publicUrl, '_blank');
            }}
          >
            {title}
          </JobTitle>
          <CompanyName>{safeCompany}</CompanyName>
        </JobInfo>
      </TopSection>
      <BottomSection>
        <div>
          <DetailsRow>
            <WorkDetails>
              <span>
                <FaClock size={12} /> {modality}
              </span>
              <span>
                <FaGlobe size={12} /> {remoteStatus}
              </span>
            </WorkDetails>
            <Salary>
              <FaMoneyBillWave size={12} /> {salary}
            </Salary>
          </DetailsRow>
          <DetailsRow>
            <Location>
              <FaMapMarkerAlt size={12} /> {location}
            </Location>
            <Published>{timeSincePublished()}</Published>
          </DetailsRow>
          <DetailsRow>
            <PortalInfo>
              <PortalLogo src="https://d2dgum4gsvdsrq.cloudfront.net/assets/icon-new-c18debbaa69bac8df6158426f4a00752b32a7fba603cba4eeb3e4572466344a6.png" alt="GetOnBoard" />
              {portal}
            </PortalInfo>
            <Perks>
              {perks.map((perk: string, index: number) => (
                <PerkBadge key={index}>{perk}</PerkBadge>
              ))}
            </Perks>
          </DetailsRow>
        </div>
        <Actions>
          <SaveButton onClick={onSave} aria-label={isSaved ? 'Eliminar de guardados' : 'Guardar empleo'}>
            <FaBookmark color={isSaved ? '#FF4D4F' : '#333'} size={16} /> {isSaved ? 'Guardado' : 'Guardar'}
          </SaveButton>
          <InterestedButton onClick={handleInterested} aria-label="Marcar como interesado">
            <FaHeart
              color={isInterested ? '#FF4D4F' : '#333'}
              size={16}
              style={{
                transition: 'transform 0.2s',
                transform: isInterested ? 'scale(1.2)' : 'scale(1)',
              }}
            />{' '}
            Interesado ({interested})
          </InterestedButton>
          <ShareButton onClick={handleShare} aria-label="Compartir empleo">
            <FaShareAlt
              size={16}
              style={{
                transition: 'transform 0.2s',
                transform: shareClicked ? 'scale(1.2)' : 'scale(1)',
              }}
            />{' '}
            {shareClicked ? 'Copiado' : 'Share'}
          </ShareButton>
          <LinkButton
            onClick={() => {
              onApply();
              window.open(publicUrl, '_blank');
            }}
            aria-label="Ver detalles del empleo"
          >
            Link to
          </LinkButton>
        </Actions>
      </BottomSection>
    </Card>
  );
};

export default JobCard;