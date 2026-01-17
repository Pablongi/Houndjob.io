import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FilterState } from '@/types/filter';

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
  const selected: { type: string; value: string }[] = [];

  filters.selectedPortals.forEach((p: string) => selected.push({ type: 'portal', value: p }));
  filters.selectedCategories.forEach((c: string) => selected.push({ type: 'category', value: c }));
  filters.selectedSubcategories.forEach((s: string) => selected.push({ type: 'subcategory', value: s }));
  filters.selectedTags.forEach((t: string) => selected.push({ type: 'tag', value: t }));
  filters.selectedRegions.forEach((r: string) => selected.push({ type: 'region', value: r }));
  if (filters.company) selected.push({ type: 'company', value: filters.company });
  filters.selectedJobTitles.forEach((j: string) => selected.push({ type: 'jobTitle', value: j }));
  filters.selectedModalities.forEach((m: string) => selected.push({ type: 'modality', value: m }));
  filters.selectedExperiences.forEach((e: string) => selected.push({ type: 'experience', value: e }));

  const removeSelected = (type: string, value: string) => {
    const newFilters: Partial<FilterState> = {};
    if (type === 'company') {
      newFilters.company = '';
    } else {
      const filterKey = 
        type === 'portal' ? 'selectedPortals' :
        type === 'category' ? 'selectedCategories' :
        type === 'subcategory' ? 'selectedSubcategories' :
        type === 'tag' ? 'selectedTags' :
        type === 'region' ? 'selectedRegions' :
        type === 'jobTitle' ? 'selectedJobTitles' :
        type === 'modality' ? 'selectedModalities' :
        type === 'experience' ? 'selectedExperiences' : '';
      if (filterKey) {
        const currentSet = new Set(filters[filterKey as keyof FilterState] as Set<string>);
        currentSet.delete(value);
        newFilters[filterKey] = currentSet;
      }
    }
    onFilter(newFilters);
  };

  return (
    <SelectedContainer>
      {selected.map((s, idx: number) => (
        <Chip key={idx} role="button" aria-label={`Filtro seleccionado: ${s.value}`}>
          {s.value}
          <RemoveButton
            onClick={() => removeSelected(s.type, s.value)}
            aria-label={`Eliminar filtro ${s.value}`}
          >
            ×
          </RemoveButton>
        </Chip>
      ))}
    </SelectedContainer>
  );
};

export default SelectedFilters;