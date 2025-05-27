import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FilterState } from 'types/filter';

const HeaderContainer = styled.header`
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  padding: 8px 16px;
  border-bottom: 1px solid var(--zhipin-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.h1`
  font-size: 20px;
  color: var(--zhipin-teal);
  margin: 0;
`;

const CountryFilter = styled.div`
  display: flex;
  gap: 4px;
`;

interface CountryButtonProps {
  active?: boolean;
}

const CountryButton = styled(motion.button)<CountryButtonProps>`
  padding: 4px;
  background: ${({ active }) => (active ? '#fff' : '#f0f0f0')};
  border: 1px solid ${({ active }) => (active ? 'var(--zhipin-teal)' : 'var(--zhipin-border)')};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    background: ${({ active }) => (active ? '#f0f0f0' : '#e0e0e0')};
  }
`;

const CountryFlag = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
`;

const ResetButton = styled(motion.button)`
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid var(--zhipin-border);
  border-radius: 16px;
  cursor: pointer;
  color: var(--zhipin-text);
  font-size: 12px; /* Increased from 10px */
  font-family: sans-serif;
  transition: background 0.2s ease;
  &:hover {
    background: #e0e0e0;
  }
`;

interface HeaderProps {
  onReset: () => void;
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allCountries: string[];
}

const Header: React.FC<HeaderProps> = ({ onReset, filters, onFilter, allCountries }) => {
  const handleCountryClick = (country: string) => {
    const newCountries = new Set(filters.selectedCountries);
    if (newCountries.has(country)) newCountries.delete(country);
    else newCountries.add(country);
    onFilter({ selectedCountries: newCountries });
  };

  const countryFlags: { [key: string]: string } = {
    'Chile': '/chile_flag.png',
    'Argentina': '/argentina_flag.png',
    'Colombia': '/colombia_flag.png',
    'Peru': '/peru_flag.png',
    'Mexico': '/mexico_flag.png',
    'Remote': '/remote.png',
  };

  const sortedCountries = [...allCountries].sort((a, b) => {
    if (a === 'Chile') return -1;
    if (b === 'Chile') return 1;
    return a.localeCompare(b);
  });

  return (
    <HeaderContainer>
      <LogoSection>
        <Logo>HoundJob</Logo>
        <CountryFilter>
          {sortedCountries.map((country) => (
            <CountryButton
              key={country}
              active={filters.selectedCountries.has(country)}
              onClick={() => handleCountryClick(country)}
              animate={{ scale: filters.selectedCountries.has(country) ? 1.05 : 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={country}
            >
              <CountryFlag src={countryFlags[country] || '/default_flag.png'} alt={`${country} flag`} onError={(e) => (e.currentTarget.style.display = 'none')} />
            </CountryButton>
          ))}
        </CountryFilter>
      </LogoSection>
      <ResetButton onClick={onReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        Reiniciar Filtros
      </ResetButton>
    </HeaderContainer>
  );
};

export default Header;