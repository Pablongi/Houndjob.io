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

interface SubcategoryButtonProps {
  active?: boolean;
}

const SubcategoryButton = styled(motion.button)<SubcategoryButtonProps>`
  padding: 2px 4px;
  background: ${({ active }) => (active ? '#fff' : '#E6F0FA')};
  color: ${({ active }) => (active ? 'var(--zhipin-teal)' : 'var(--zhipin-text)')};
  border: 1px solid ${({ active }) => (active ? 'var(--zhipin-teal)' : '#E6F0FA')};
  border-radius: 16px;
  cursor: pointer;
  margin: 0 1px;
  font-size: 12px; /* Increased from 10px */
  font-family: sans-serif;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease, border 0.2s ease, color 0.2s ease, transform 0.1s ease;
  &:hover {
    background: ${({ active }) => (active ? '#f0f0f0' : '#d9e8f6')};
    transform: translateY(-1px);
  }
`;

interface SubcategoryFilterProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allSubcategories: string[];
  popularSubcategories: string[];
}

const SubcategoryFilter: React.FC<SubcategoryFilterProps> = ({ filters, onFilter, allSubcategories, popularSubcategories }) => {
  const handleSubcategoryClick = (subcategory: string) => {
    const newSubcategories = new Set(filters.selectedSubcategories);
    if (newSubcategories.has(subcategory)) newSubcategories.delete(subcategory);
    else newSubcategories.add(subcategory);
    onFilter({ selectedSubcategories: newSubcategories });
  };

  return (
    <FilterRow>
      <DropdownSection>
        <FilterDropdown
          label="Subcategorías"
          options={allSubcategories}
          selectedOptions={filters.selectedSubcategories}
          onToggleOption={handleSubcategoryClick}
        />
      </DropdownSection>
      <CarouselSection>
        <Carousel>
          {popularSubcategories.length > 0 ? (
            popularSubcategories.map((subcategory) => (
              <SubcategoryButton
                key={subcategory}
                active={filters.selectedSubcategories.has(subcategory)}
                onClick={() => handleSubcategoryClick(subcategory)}
                animate={{ scale: filters.selectedSubcategories.has(subcategory) ? 1.05 : 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {subcategory}
              </SubcategoryButton>
            ))
          ) : (
            <p style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>No subcategories available.</p>
          )}
        </Carousel>
      </CarouselSection>
    </FilterRow>
  );
};

export default SubcategoryFilter;