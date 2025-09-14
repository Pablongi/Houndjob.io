import React, { memo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Job, Tag } from '@/types/job';
import { useAppContext } from '@/components/filters/FilterContext';
import { FilterButton } from '@/components/filters/FilterCategory';
import { normalizeText } from '@/logic/filterUtils';

const Card = styled(motion.div)`
  background: var(--card-gradient); /* Updated to use gradient */
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: var(--card-hover-shadow);
  }
  min-height: 300px; /* Altura mínima para consistencia en grid */
  height: auto;
  @media (max-width: 768px) {
    padding: 12px;
    min-height: 280px;
  }
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TitleLink = styled.a`
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  &:hover {
    color: var(--primary);
  }
`;

const LocationSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-light);
`;

const CountryFlag = styled.img`
  width: 16px;
  height: 16px;
  loading: lazy;
`;

const CompanySection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompanyLogo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  loading: lazy;
`;

const CompanyName = styled.p`
  font-size: 14px;
  color: var(--primary);
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const PublishedDate = styled.p`
  font-size: 12px;
  color: var(--text-light);
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BottomLeft = styled.div``;

const BottomRight = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--primary);
  &:hover {
    text-decoration: underline;
  }
`;

const PortalButton = styled(ActionButton)`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PortalImg = styled.img`
  width: 16px;
  height: 16px;
  loading: lazy;
`;

const CategorySection = styled.div`
  display: flex;
  gap: 4px;
`;

const SubcategorySection = styled(CategorySection)``;

const countryToFlag: { [key: string]: string } = {
  Chile: '/flags/chile_flag.png',
  Argentina: '/flags/argentina_flag.png',
  Colombia: '/flags/colombia_flag.png',
  Mexico: '/flags/mexico_flag.png',
  Peru: '/flags/peru_flag.png',
};

const portalToLogo: { [key: string]: string } = {
  'get on board': '/portals/getonboard.png',
  'bne.cl': '/portals/Portal-BNE_logo.png',
  'trabajoconsentido': '/portals/Trabajoconsentido_logo.png',
};

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = memo(({ job }) => {
  const { setFilters } = useAppContext();

  if (process.env.NODE_ENV !== 'production') {
    console.log('Rendering JobCard for job ID:', job.id);
  }

  const date = new Date(job.attributes.creation_date);
  const timestamp = isNaN(date.getTime()) ? Date.now() : date.getTime();
  const daysAgo = Math.floor((Date.now() - timestamp) / (1000 * 3600 * 24));
  const publishedText = `Posted ${daysAgo} days ago`;

  const uniqueCategories = [...new Set(job.tags.map(t => t.categoría).filter((c): c is string => !!c))].slice(0, 2);
  const uniqueSubcategories = [...new Set(job.tags.map(t => t.subcategoría).filter((s): s is string => !!s))].slice(0, 3);

  const applyFilter = (type: 'category' | 'subcategory' | 'tag' | 'company', value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (type === 'company') {
        newFilters.company = value;
      } else {
        const setKey = type === 'category' ? 'selectedCategories' :
          type === 'subcategory' ? 'selectedSubcategories' : 'selectedTags';
        const currentSet = new Set(newFilters[setKey]);
        currentSet.add(value);
        newFilters[setKey] = currentSet;
      }
      return newFilters;
    });
  };

  const searchSimilar = () => {
    const similarSearch = [...new Set(job.tags.map(t => t.tag))].join(' ');
    setFilters(prev => ({ ...prev, search: similarSearch }));
  };

  const normalizedPortal = normalizeText(job.attributes.portal).toLowerCase();
  const logoSrc = portalToLogo[normalizedPortal] || '/portals/Trabajoconsentido_logo.png';

  return (
    <Card role="article" aria-label={`Oferta de empleo: ${job.attributes.title}`}>
      <TopSection>
        <TitleLink href={job.publicUrl} target="_blank" rel="noopener noreferrer">{job.attributes.title}</TitleLink>
        <LocationSection>
          {job.attributes.country && countryToFlag[job.attributes.country] && <CountryFlag src={countryToFlag[job.attributes.country]} alt={`Bandera de ${job.attributes.country}`} />}
          {job.attributes.region ? `${job.attributes.region}, ` : ''}{job.attributes.country}
        </LocationSection>
      </TopSection>
      <CompanySection>
        {job.attributes.logo_url && <CompanyLogo src={job.attributes.logo_url} alt={`Logo de ${job.attributes.company}`} />}
        <CompanyName onClick={() => applyFilter('company', job.attributes.company)}>{job.attributes.company}</CompanyName>
      </CompanySection>
      {uniqueCategories.length > 0 && (
        <CategorySection>
          {uniqueCategories.map((cat, index) => (
            <FilterButton
              key={`${cat}-${index}`}
              active={false}
              onClick={() => applyFilter('category', cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </FilterButton>
          ))}
        </CategorySection>
      )}
      {uniqueSubcategories.length > 0 && (
        <SubcategorySection>
          {uniqueSubcategories.map((sub, index) => (
            <FilterButton
              key={`${sub}-${index}`}
              active={false}
              onClick={() => applyFilter('subcategory', sub)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sub}
            </FilterButton>
          ))}
        </SubcategorySection>
      )}
      <TagContainer>
        {job.tags.slice(0, 5).map((t: Tag, index) => (
          t.tag && (
            <FilterButton
              key={`${t.tag}-${index}`}
              active={false}
              onClick={() => applyFilter('tag', t.tag)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t.tag}
            </FilterButton>
          )
        ))}
      </TagContainer>
      <BottomSection>
        <BottomLeft>
          <PublishedDate>{publishedText}</PublishedDate>
        </BottomLeft>
        <BottomRight>
          <ActionButton aria-label="Guardar">Guardar</ActionButton>
          <ActionButton aria-label="Compartir">Compartir</ActionButton>
          <ActionButton onClick={searchSimilar} aria-label="Buscar similares">Buscar similares</ActionButton>
          <PortalButton aria-label="Portal">
            <PortalImg src={logoSrc} alt={`Logo de ${job.attributes.portal}`} />
          </PortalButton>
        </BottomRight>
      </BottomSection>
    </Card>
  );
});

export default JobCard;