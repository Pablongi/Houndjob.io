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

interface CategoryButtonProps {
  active?: boolean;
}

const CategoryButton = styled(motion.button)<CategoryButtonProps>`
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

interface CategoryFilterProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allCategories: string[];
  popularCategories: string[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ filters, onFilter, allCategories, popularCategories }) => {
  const handleCategoryClick = (category: string) => {
    const newCategories = new Set(filters.selectedCategories);
    if (newCategories.has(category)) newCategories.delete(category);
    else newCategories.add(category);
    onFilter({ selectedCategories: newCategories });
  };

  return (
    <FilterRow>
      <DropdownSection>
        <FilterDropdown
          label="Categorías"
          options={allCategories}
          selectedOptions={filters.selectedCategories}
          onToggleOption={handleCategoryClick}
        />
      </DropdownSection>
      <CarouselSection>
        <Carousel>
          {popularCategories.length > 0 ? (
            popularCategories.map((category) => (
              <CategoryButton
                key={category}
                active={filters.selectedCategories.has(category)}
                onClick={() => handleCategoryClick(category)}
                animate={{ scale: filters.selectedCategories.has(category) ? 1.05 : 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </CategoryButton>
            ))
          ) : (
            <p style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>No categories available.</p>
          )}
        </Carousel>
      </CarouselSection>
    </FilterRow>
  );
};

export default CategoryFilter;