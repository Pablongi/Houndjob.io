// /frontend/src/components/filters/FiltersPanel.tsx
import styled from 'styled-components';
import { useAppContext } from './FilterContext';
import { portals, SALARY_RANGES } from '@/constants';   // ←←← SALARY_RANGES agregado
import FilterCategory from './FilterCategory';
import SelectedFilters from './SelectedFilters';
import { computeFrequencies } from '@/utils/frequencies';
import { Job } from '@/types/job';
import { FilterState } from '@/types/filter';
import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  margin-left: auto;
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
  &:checked { background: var(--primary); }
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
  &:checked:before { left: 17px; }
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
  &:hover { background: #ffd0d0; }
`;

const MinimizeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--primary);
  text-align: center;
  width: 100%;
  &:hover { text-decoration: underline; }
`;

const PortalRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  overflow: hidden;
`;

interface FiltersPanelProps {
  allJobs: Job[];
  onMinimize: (min: boolean) => void;
  isMinimized?: boolean;
}

const FiltersPanel = ({ allJobs, onMinimize, isMinimized = false }: FiltersPanelProps) => {
  const {
    filters,
    setFilters,
    strictMode,
    setStrictMode,
    categoriesData,
    catToSubs,
    subToTags,
  } = useAppContext();

  const frequencies = computeFrequencies(allJobs, filters);

  const [internalMinimized, setInternalMinimized] = useState(isMinimized);

  useEffect(() => {
    onMinimize(internalMinimized);
  }, [internalMinimized, onMinimize]);

  const resetFilters = () => {
    logger.actionStart('Limpiar TODOS los filtros');
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
      selectedSalary: new Set(),           // ←←← NUEVO: filtro salario
    });
    logger.actionEnd('Limpiar TODOS los filtros', true);
  };

  const handleFilter = (newFilters: Partial<FilterState>) => {
    logger.actionStart('Actualizando filtros desde SelectedFilters');
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }));
    logger.actionEnd('Actualizando filtros desde SelectedFilters', true);
  };

  const portalItems = portals.map((p: string) => ({
    name: p,
    logo: p === 'BNE.cl' ? '/portals/Portal-BNE_logo.png' : p === 'Get on Board' ? '/portals/getonboard.png' : '/portals/Trabajoconsentido_logo.png',
  }));

  const categoryItems = categoriesData.map((cat: any) => ({ name: cat.name }));
  const allCategoryItems = categoryItems;

  const subcategoryItems = Array.from(catToSubs.values())
    .flatMap((subs: Set<string>) => Array.from(subs).map(name => ({ name })));
  const allSubcategoryItems = subcategoryItems;

  const tagItems = Array.from(subToTags.values())
    .flatMap((tags: Set<string>) => Array.from(tags).map(name => ({ name })));
  const allTagItems = tagItems;

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
                onChange={() => {
                  logger.actionStart('Cambio modo Estrictos');
                  setStrictMode(!strictMode);
                  logger.actionEnd('Cambio modo Estrictos', true);
                }}
                aria-label="Activar o desactivar filtros estrictos"
              />
            </SwitchContainer>
            <EraseButton onClick={resetFilters} aria-label="Borrar todos los filtros">Borrar filtros</EraseButton>
          </ControlsContainer>
        </PortalRow>

        <FilterCategory
          category="categories"
          label="Categorías"
          items={categoryItems}
          selectedItems={filters.selectedCategories}
          onFilter={handleFilter}
          allItems={allCategoryItems}
          displayMode="carousel"
          isSearchable={true}
        />

        <FilterCategory
          category="subcategories"
          label="Subcategorías"
          items={subcategoryItems}
          selectedItems={filters.selectedSubcategories}
          onFilter={handleFilter}
          allItems={allSubcategoryItems}
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

        {/* ←←← FILTRO DE SALARIO (nuevo) */}
        <FilterCategory 
  category="salary"
  label="Salario"
  items={frequencies.salaries.slice(0, 100)}
  selectedItems={filters.selectedSalary}
  onFilter={handleFilter}
  allItems={frequencies.salaries}
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
        onClick={() => {
          logger.actionStart(internalMinimized ? 'Mostrar panel de filtros' : 'Ocultar panel de filtros');
          setInternalMinimized(!internalMinimized);
          logger.actionEnd(internalMinimized ? 'Mostrar panel de filtros' : 'Ocultar panel de filtros', true);
        }}
        aria-label={internalMinimized ? 'Mostrar panel de filtros' : 'Ocultar panel de filtros'}
      >
        {internalMinimized ? 'Mostrar Filtros' : 'Ocultar Filtros'}
      </MinimizeButton>
    </div>
  );
};

export default FiltersPanel;