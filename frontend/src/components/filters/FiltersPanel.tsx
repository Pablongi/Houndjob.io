import React from 'react';
import styled from 'styled-components';
import { useAppContext } from './FilterContext';
import { portals } from '@/constants';
import FilterCategory from './FilterCategory';
import SelectedFilters from './SelectedFilters';
import { computeFrequencies } from '@/utils/frequencies';
import { Job } from '@/types/job';
import { FilterState } from '@/types/filter';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto; /* No expande */
  margin-left: auto; /* Alinea a extremo derecho */
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SwitchLabel = styled.label`
  font-size: 12px;
  color: var(--text);
`;

const SwitchToggle = styled.input`
  appearance: none;
  width: 32px;
  height: 16px;
  background: var(--chip-bg);
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  &:checked {
    background: var(--primary);
  }
  &:before {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 50%;
    top: 1px;
    left: 1px;
    transition: left 0.3s;
  }
  &:checked:before {
    left: 17px;
  }
`;

const EraseButton = styled.button`
  background: var(--chip-bg);
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--accent-red);
  white-space: nowrap;
  &:hover {
    background: #ffd0d0;
  }
`;

const MinimizeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--primary);
  text-align: center;
  width: 100%;
  &:hover {
    text-decoration: underline;
  }
`;

const PortalRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px; /* Compacta */
  overflow: hidden;
`;

interface FiltersPanelProps {
  allJobs: Job[];
  onMinimize: (min: boolean) => void;
  isMinimized?: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ allJobs, onMinimize, isMinimized = false }) => {
  const { filters, setFilters, strictMode, setStrictMode, jobs } = useAppContext();
  const frequencies = computeFrequencies(allJobs, filters);
  const [internalMinimized, setInternalMinimized] = React.useState(isMinimized);

  React.useEffect(() => {
    onMinimize(internalMinimized);
  }, [internalMinimized, onMinimize]);

  const resetFilters = () => {
    setFilters({
      search: '',
      selectedCategories: new Set(),
      selectedSubcategories: new Set(),
      selectedTags: new Set(),
      selectedPortals: new Set(),
      selectedCountries: new Set(),
      selectedRegions: new Set(),
      company: '',
      selectedJobTitles: new Set(),
      selectedModalities: new Set(),
      selectedExperiences: new Set(),
    });
  };

  const handleFilter = (newFilters: Partial<FilterState>) => {
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }));
  };

  const portalItems = portals.map((p: string) => ({
    name: p,
    logo:
      p === 'BNE.cl'
        ? '/portals/Portal-BNE_logo.png'
        : p === 'Get on Board'
        ? '/portals/getonboard.png'
        : '/portals/Trabajoconsentido_logo.png',
  }));

  const tagItems = frequencies.tags.slice(0, 100).map((t: {tag: string, count: number}) => ({
    name: t.tag,
    count: t.count,
  }));

  const allTagItems = frequencies.tags.map((t: {tag: string, count: number}) => ({
    name: t.tag,
    count: t.count,
  }));

  return (
    <div role="search" aria-label="Panel de filtros" tabIndex={-1}>
      <div style={{ display: internalMinimized ? 'none' : 'block', transition: 'opacity 0.3s ease-in-out' }}>
        <SelectedFilters filters={filters} onFilter={handleFilter} />
        <PortalRow>
          <FilterCategory
            category="portals"
            label="Portales"
            items={portalItems}
            selectedItems={filters.selectedPortals}
            onFilter={handleFilter}
            allItems={portalItems}
            displayMode="carousel"
            isPortal={true}
            hideTab={true}
          />
          <ControlsContainer>
            <SwitchContainer>
              <SwitchLabel>Estrictos</SwitchLabel>
              <SwitchToggle
                type="checkbox"
                checked={strictMode}
                onChange={() => setStrictMode(!strictMode)}
                aria-label="Activar o desactivar filtros estrictos"
              />
            </SwitchContainer>
            <EraseButton onClick={resetFilters} aria-label="Borrar todos los filtros">Borrar filtros</EraseButton>
          </ControlsContainer>
        </PortalRow>
        <FilterCategory
          category="categories"
          label="Categorías"
          items={frequencies.categories.slice(0, 100)}
          selectedItems={filters.selectedCategories}
          onFilter={handleFilter}
          allItems={frequencies.categories}
          displayMode="carousel"
          isSearchable={true}
        />
        <FilterCategory
          category="subcategories"
          label="Subcategorías"
          items={frequencies.subcategories.slice(0, 100)}
          selectedItems={filters.selectedSubcategories}
          onFilter={handleFilter}
          allItems={frequencies.subcategories}
          displayMode="carousel"
          isSearchable={true}
        />
        <FilterCategory
          category="tags"
          label="Tags"
          items={tagItems}
          selectedItems={filters.selectedTags}
          onFilter={handleFilter}
          allItems={allTagItems}
          displayMode="carousel"
          isSearchable={true}
        />
        <FilterCategory
          category="companies"
          label="Empresas"
          items={frequencies.companies.slice(0, 100)}
          selectedItems={filters.company}
          onFilter={handleFilter}
          allItems={frequencies.companies}
          displayMode="carousel"
          isSearchable={true}
        />
        <FilterCategory
          category="regions"
          label="Regiones"
          items={frequencies.regions.slice(0, 100)}
          selectedItems={filters.selectedRegions}
          onFilter={handleFilter}
          allItems={frequencies.regions}
          displayMode="carousel"
          isSearchable={true}
        />
        <FilterCategory
          category="jobTitles"
          label="Títulos de Empleo"
          items={frequencies.jobTitles.slice(0, 100)}
          selectedItems={filters.selectedJobTitles}
          onFilter={handleFilter}
          allItems={frequencies.jobTitles}
          displayMode="carousel"
          isSearchable={true}
        />
        <FilterCategory
          category="modalities"
          label="Modalidades"
          items={frequencies.modalities.slice(0, 100)}
          selectedItems={filters.selectedModalities}
          onFilter={handleFilter}
          allItems={frequencies.modalities}
          displayMode="carousel"
          isSearchable={true}
        />
        <FilterCategory
          category="experiences"
          label="Niveles de Experiencia"
          items={frequencies.experiences.slice(0, 100)}
          selectedItems={filters.selectedExperiences}
          onFilter={handleFilter}
          allItems={frequencies.experiences}
          displayMode="carousel"
          isSearchable={true}
        />
        <FilterCategory
          category="countries"
          label="Países"
          items={frequencies.countries.slice(0, 100)}
          selectedItems={filters.selectedCountries}
          onFilter={handleFilter}
          allItems={frequencies.countries}
          displayMode="carousel"
          isSearchable={true}
        />
      </div>
      <MinimizeButton
        onClick={() => setInternalMinimized(!internalMinimized)}
        aria-label={internalMinimized ? 'Mostrar panel de filtros' : 'Ocultar panel de filtros'}
      >
        {internalMinimized ? 'Mostrar Filtros' : 'Ocultar Filtros'}
      </MinimizeButton>
    </div>
  );
};

export default FiltersPanel;