import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FilterState } from '@/types/filter';
import { Tag } from '@/types/job';
import { RankedItem } from '@/types/filter';

const HeaderContainer = styled.header`
  background: var(--header-bg, #fff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Logo = styled(NavLink)`
  font-size: 24px;
  font-weight: bold;
  color: var(--primary, #007bff);
  text-decoration: none;
`;

const Slogan = styled.span`
  font-size: 14px;
  color: var(--text, #333);
`;

const Pagination = styled.div`
  display: flex;
  gap: 15px;
`;

const PaginationLink = styled(NavLink)`
  color: var(--text, #333);
  text-decoration: none;
  font-size: 16px;
  &.active {
    font-weight: bold;
    color: var(--primary, #007bff);
  }
  &:hover {
    color: var(--primary, #007bff);
  }
`;

const FlagFilter = styled.div`
  display: flex;
  gap: 10px;
`;

const FlagButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  &:hover {
    opacity: 0.8;
  }
`;

const FlagImage = styled.img`
  width: 30px;
  height: 20px;
  border-radius: 3px;
`;

interface HeaderProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allTags: Tag[];
  allCategories: RankedItem[];
  allSubcategories: RankedItem[];
  allRegions: string[];
  topCompanies: RankedItem[];
}

const Header: React.FC<HeaderProps> = ({ filters, onFilter }) => {
  const [countries, setCountries] = useState<string[]>([]);
  const navigate = useNavigate();
  const flagPaths = {
    argentina: '/Flags/argentina_flag.png',
    chile: '/Flags/chile_flag.png',
    colombia: '/Flags/colombia_flag.png',
    mexico: '/Flags/mexico_flag.png',
    peru: '/Flags/peru_flag.png',
    remote: '/Flags/remote.png',
  };

  useEffect(() => {
    setCountries(Object.keys(flagPaths));
  }, []);

  const handleCountrySelect = (country: string) => {
    const updatedCountries = new Set(filters.selectedCountries);
    if (updatedCountries.has(country)) {
      updatedCountries.delete(country);
    } else {
      updatedCountries.add(country);
    }
    onFilter({ selectedCountries: updatedCountries });
  };

  return (
    <HeaderContainer>
      <LogoSection>
        <Logo to="/">HoundJob</Logo>
        <Slogan>Encuentra tu próximo trabajo</Slogan>
      </LogoSection>
      <Pagination>
        <PaginationLink to="/" end>
          Home
        </PaginationLink>
        <PaginationLink to="/filters">
          Filters
        </PaginationLink>
      </Pagination>
      <FlagFilter>
        {countries.map((country) => (
          <FlagButton
            key={country}
            onClick={() => handleCountrySelect(country)}
            aria-label={`Filter by ${country}`}
          >
            <FlagImage src={flagPaths[country as keyof typeof flagPaths]} alt={`${country} flag`} />
          </FlagButton>
        ))}
      </FlagFilter>
    </HeaderContainer>
  );
};

export default Header;