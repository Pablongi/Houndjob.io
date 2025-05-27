import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Carousel from './Carousel';
import FilterDropdown from './FilterDropdown';
import { FilterState } from 'types/filter';
import { Tag } from 'types/job';

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

interface TagButtonProps {
  active?: boolean;
}

const TagButton = styled(motion.button)<TagButtonProps>`
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

interface TagFilterProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allTags: Tag[];
  popularTags: Tag[];
}

const TagFilter: React.FC<TagFilterProps> = ({ filters, onFilter, allTags, popularTags }) => {
  const handleTagClick = (tag: string) => {
    const newTags = new Set(filters.selectedTags);
    if (newTags.has(tag)) newTags.delete(tag);
    else newTags.add(tag);
    onFilter({ selectedTags: newTags });
  };

  return (
    <FilterRow>
      <DropdownSection>
        <FilterDropdown
          label="Tags"
          options={allTags.map(tag => tag.tag)}
          selectedOptions={filters.selectedTags}
          onToggleOption={handleTagClick}
        />
      </DropdownSection>
      <CarouselSection>
        <Carousel>
          {popularTags.length > 0 ? (
            popularTags.map((tag) => (
              <TagButton
                key={tag.tag}
                active={filters.selectedTags.has(tag.tag)}
                onClick={() => handleTagClick(tag.tag)}
                animate={{ scale: filters.selectedTags.has(tag.tag) ? 1.05 : 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                #{tag.tag}
              </TagButton>
            ))
          ) : (
            <p style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>No tags available.</p>
          )}
        </Carousel>
      </CarouselSection>
    </FilterRow>
  );
};

export default TagFilter;