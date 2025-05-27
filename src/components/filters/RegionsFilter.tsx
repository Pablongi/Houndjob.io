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

interface RegionButtonProps {
  active?: boolean;
}

const RegionButton = styled(motion.button)<RegionButtonProps>`
  padding: 2px 4px;
  background: ${({ active }) => (active ? '#fff' : '#E6F0FA')};
  color: ${({ active }) => (active ? 'var(--zhipin-teal)' : 'var(--zhipin-text)')};
  border: 1px solid ${({ active }) => (active ? 'var(--zhipin-teal)' : '#E6F0FA')};
  border-radius: 16px;
  cursor: pointer;
  margin: 0 1px;
  font-size: 12px;
  font-family: sans-serif;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease, border 0.2s ease, color 0.2s ease, transform 0.1s ease;
  &:hover {
    background: ${({ active }) => (active ? '#f0f0f0' : '#d9e8f6')};
    transform: translateY(-1px);
  }
`;

interface RegionsFilterProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allRegions: string[];
  popularRegions: string[];
}

const RegionsFilter: React.FC<RegionsFilterProps> = ({ filters, onFilter, allRegions, popularRegions }) => {
  // Log available regions to debug
  console.log('RegionsFilter - All Regions:', allRegions);
  console.log('RegionsFilter - Popular Regions:', popularRegions);

  const handleRegionClick = (region: string) => {
    const newRegions = new Set(filters.selectedRegions);
    if (newRegions.has(region)) newRegions.delete(region);
    else newRegions.add(region);
    onFilter({ selectedRegions: newRegions });
  };

  return (
    <FilterRow>
      <DropdownSection>
        <FilterDropdown
          label="Regiones"
          options={allRegions}
          selectedOptions={filters.selectedRegions}
          onToggleOption={handleRegionClick}
        />
      </DropdownSection>
      <CarouselSection>
        <Carousel>
          {popularRegions.length > 0 ? (
            popularRegions.map((region) => (
              <RegionButton
                key={region}
                active={filters.selectedRegions.has(region)}
                onClick={() => handleRegionClick(region)}
                animate={{ scale: filters.selectedRegions.has(region) ? 1.05 : 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {region}
              </RegionButton>
            ))
          ) : (
            <p style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>No regions available.</p>
          )}
        </Carousel>
      </CarouselSection>
    </FilterRow>
  );
};

export default RegionsFilter;