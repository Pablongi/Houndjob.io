import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Carousel from './Carousel';
import FilterDropdown from './FilterDropdown';
import { FilterState } from 'types/filter';

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DropdownSection = styled.div`
  width: 20%;
`;

const CarouselSection = styled.div`
  width: 80%;
`;

interface CompanyButtonProps {
  active?: boolean;
}

const CompanyButton = styled(motion.button)<CompanyButtonProps>`
  padding: 2px 4px;
  background: ${({ active }) => (active ? '#fff' : '#E6F0FA')};
  color: ${({ active }) => (active ? 'var(--zhipin-teal)' : 'var(--zhipin-text)')};
  border: 1px solid ${({ active }) => (active ? 'var(--zhipin-teal)' : '#E6F0FA')};
  border-radius: 16px;
  cursor: pointer;
  margin: 0 1px;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px; /* Increased from 10px */
  font-family: sans-serif;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease, border 0.2s ease, color 0.2s ease, transform 0.1s ease;
  &:hover {
    background: ${({ active }) => (active ? '#f0f0f0' : '#d9e8f6')};
    transform: translateY(-1px);
  }
`;

const CompanyLogo = styled.img`
  width: 12px; /* Slightly increased for readability */
  height: 12px;
  border-radius: 50%;
  object-fit: cover;
`;

interface RankedItem {
  name: string;
  count: number;
  logo?: string;
}

interface CompaniesFilterProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allCompanies: RankedItem[];
  popularCompanies: RankedItem[];
}

const CompaniesFilter: React.FC<CompaniesFilterProps> = ({ filters, onFilter, allCompanies, popularCompanies }) => {
  const handleCompanyClick = (company: string) => {
    onFilter({ company: filters.company === company ? '' : company });
  };

  return (
    <FilterRow>
      <DropdownSection>
        <FilterDropdown
          label="Empresas"
          options={allCompanies.map(company => company.name)}
          selectedOptions={new Set(filters.company ? [filters.company] : [])}
          onToggleOption={handleCompanyClick}
        />
      </DropdownSection>
      <CarouselSection>
        <Carousel>
          {popularCompanies.length > 0 ? (
            popularCompanies.map((company) => (
              <CompanyButton
                key={company.name}
                active={filters.company === company.name}
                onClick={() => handleCompanyClick(company.name)}
                animate={{ scale: filters.company === company.name ? 1.05 : 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {company.logo && <CompanyLogo src={company.logo} alt={`${company.name} logo`} onError={(e) => (e.currentTarget.style.display = 'none')} />}
                {company.name} ({company.count})
              </CompanyButton>
            ))
          ) : (
            <p style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>No companies available.</p>
          )}
        </Carousel>
      </CarouselSection>
    </FilterRow>
  );
};

export default CompaniesFilter;