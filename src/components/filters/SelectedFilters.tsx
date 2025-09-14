
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FilterState } from '@/types/filter';
import { normalizeText } from '@/logic/filterUtils';

const SelectedContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Chip = styled(motion.div)`
  padding: 4px 12px;
  background: var(--chip-bg);
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text);
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent-red);
  font-size: 12px;
`;

interface SelectedFiltersProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
}

const SelectedFilters: React.FC<SelectedFiltersProps> = ({ filters, onFilter }) => {
  const selected = [];

  filters.selectedPortals.forEach((p) => selected.push({ type: 'portal', value: p }));
  filters.selectedCategories.forEach((c) => selected.push({ type: 'category', value: c }));
  filters.selectedSubcategories.forEach((s) => selected.push({ type: 'subcategory', value: s }));
  filters.selectedTags.forEach((t) => selected.push({ type: 'tag', value: t }));
  filters.selectedRegions.forEach((r) => selected.push({ type: 'region', value: r }));
  if (filters.company) selected.push({ type: 'company', value: filters.company });
  filters.selectedJobTitles.forEach((j) => selected.push({ type: 'jobTitle', value: j }));
  filters.selectedModalities.forEach((m) => selected.push({ type: 'modality', value: m }));
  filters.selectedExperiences.forEach((e) => selected.push({ type: 'experience', value: e }));
  filters.selectedCountries.forEach((c) => selected.push({ type: 'country', value: c }));

  const removeSelected = (type: string, value: string) => {
    const newFilters: Partial<FilterState> = {};
    if (type === 'company') {
      newFilters.company = '';
    } else {
      const setKey =
        type === 'portal' ? 'selectedPortals' :
        type === 'category' ? 'selectedCategories' :
        type === 'subcategory' ? 'selectedSubcategories' :
        type === 'tag' ? 'selectedTags' :
        type === 'region' ? 'selectedRegions' :
        type === 'jobTitle' ? 'selectedJobTitles' :
        type === 'modality' ? 'selectedModalities' :
        type === 'experience' ? 'selectedExperiences' :
        type === 'country' ? 'selectedCountries' : '';
      if (setKey) {
        const currentSet = new Set(filters[setKey as keyof FilterState] as Set<string>);
        currentSet.delete(value);
        newFilters[setKey] = currentSet;
      }
    }
    onFilter(newFilters);
  };

  return (
    <SelectedContainer>
      {selected.map((s, idx) => (
        <Chip key={idx}>
          {s.value}
          <RemoveButton onClick={() => removeSelected(s.type, s.value)}>×</RemoveButton>
        </Chip>
      ))}
    </SelectedContainer>
  );
};

export default SelectedFilters;
