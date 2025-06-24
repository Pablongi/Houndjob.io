import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FilterState } from '@/types/filter';
import { Tag, RankedItem } from '@/types/job';
import { portals } from '@/constants';
import FilterCategory from '@/components/filters/FilterCategory';

const FilterPanelContainer = styled(motion.div)<{ mode: 'rows' | 'tabs' }>`
  width: 100%;
  padding: 16px;
  background: var(--background-panel, #ffffff);
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  ${({ mode }) =>
    mode === 'rows'
      ? `
    height: auto;
    min-height: 20vh;
  `
      : `
    height: 40vh;
    overflow-y: auto;
  `}
  position: relative;
`;

const Tabs = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 8px 8px;
  border-bottom: 1px solid var(--border, #e0e0e0);
`;

const Tab = styled(motion.button)<{ active: boolean }>`
  padding: 8px 16px;
  background: ${({ active }) => (active ? '#00c4b4' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : 'var(--text, #333)')};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  &:hover {
    background: ${({ active }) => (active ? '#00a89a' : 'var(--chip-bg, #e8ecef)')};
  }
  &:focus {
    outline: 2px solid #00c4b4;
    outline-offset: 2px;
  }
`;

const FilterContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ClearFiltersButton = styled(motion.button)`
  padding: 8px 16px;
  background: var(--background-panel, #fff);
  border: 1px solid var(--border, #e8ecef);
  border-radius: 8px;
  color: var(--text, #333);
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: #ff4d4f;
    color: #fff;
    border-color: #ff4d4f;
  }
  &:focus {
    outline: 2px solid #00c4b4;
  }
`;

interface WindowsSearcherProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  allTags: Tag[];
  allCategories: RankedItem[];
  allSubcategories: RankedItem[];
  allRegions: string[];
  topCompanies: RankedItem[];
}

const WindowsSearcher: React.FC<WindowsSearcherProps> = ({
  filters,
  onFilter,
  onReset,
  allTags,
  allCategories,
  allSubcategories,
  allRegions,
  topCompanies,
}) => {
  const [activeTab, setActiveTab] = useState('search');
  const [sortMode, setSortMode] = useState('recommended');

  const categories = [
    {
      id: 'search',
      label: 'Searcher',
      items: [],
      allItems: [],
      selected: filters.search,
      isPortal: false,
    },
    {
      id: 'portals',
      label: `Portales (${portals.length})`,
      items: portals,
      allItems: portals,
      selected: filters.selectedPortals,
      isPortal: true,
    },
    {
      id: 'categories',
      label: `Categorías (${allCategories.length})`,
      items: [...allCategories, ...allSubcategories].slice(0, 30),
      allItems: [...allCategories, ...allSubcategories],
      selected: new Set([...filters.selectedCategories, ...filters.selectedSubcategories]),
      isPortal: false,
    },
    {
      id: 'tags',
      label: `Tags (${allTags.length})`,
      items: allTags.slice(0, 30).map((tag) => ({ name: tag.tag, count: tag.count })),
      allItems: allTags.map((tag) => ({ name: tag.tag, count: tag.count })),
      selected: filters.selectedTags,
      isPortal: false,
    },
    {
      id: 'regions',
      label: `Regiones (${allRegions.length})`,
      items: allRegions.map((name) => ({ name })),
      allItems: allRegions.map((name) => ({ name })),
      selected: filters.selectedRegions,
      isPortal: false,
    },
    {
      id: 'companies',
      label: `Empresas (${topCompanies.length})`,
      items: topCompanies.slice(0, 20),
      allItems: topCompanies,
      selected: filters.company,
      isPortal: false,
    },
  ];

  const handleSortChange = useCallback(
    (mode: 'recommended' | 'latest' | 'salary') => {
      setSortMode(mode);
      onFilter({ sortMode: mode });
    },
    [onFilter]
  );

  const activeCategory = categories.find((cat) => cat.id === activeTab) || categories[0];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter({ search: e.target.value });
  };

  return (
    <FilterPanelContainer mode="tabs" role="tabpanel" aria-label="Windows Searcher panel">
      <Tabs role="tablist" aria-label="Filter categories">
        {categories.map((cat) => (
          <Tab
            key={cat.id}
            active={activeTab === cat.id}
            onClick={() => setActiveTab(cat.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-selected={activeTab === cat.id}
            role="tab"
            aria-controls={`panel-${cat.id}`}
          >
            {cat.label}
          </Tab>
        ))}
      </Tabs>
      <FilterContent>
        {activeTab === 'search' ? (
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search jobs..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border, #e0e0e0)',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        ) : (
          <FilterCategory
            category={activeCategory.id}
            label={activeCategory.label.split(' ')[0]}
            items={activeCategory.items}
            selectedItems={activeCategory.selected}
            onFilter={onFilter}
            allItems={activeCategory.allItems}
            displayMode="tabs"
            isSearchable={activeTab !== 'portals'}
            isPortal={activeCategory.isPortal}
          />
        )}
        <ClearFiltersButton
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Clear all filters"
        >
          <span>✕</span> Limpiar
        </ClearFiltersButton>
      </FilterContent>
    </FilterPanelContainer>
  );
};

export default WindowsSearcher;