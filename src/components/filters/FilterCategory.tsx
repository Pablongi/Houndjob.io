import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterState } from '@/types/filter';
import { useAppContext } from './FilterContext';
import { catToSubs, subToTags } from '@/constants';

interface FilterItem {
  name: string;
  count?: number;
  logo?: string;
  value?: string;
}

interface FilterCategoryProps {
  category: string;
  label: string;
  items: FilterItem[];
  selectedItems: string | Set<string>;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allItems: FilterItem[];
  displayMode: 'carousel' | 'tabs' | 'static';
  isSearchable?: boolean;
  isPortal?: boolean;
  hideTab?: boolean;
}

const FilterContainer = styled(motion.div)`
  display: flex;
  width: 100%;
  height: 50px;
  margin-bottom: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--background);
  box-shadow: var(--shadow);
  align-items: center;
  overflow: visible;
  flex-direction: row;
  flex-wrap: nowrap;
  @media (max-width: 768px) {
    height: 45px;
    padding: 4px;
  }
`;

const CarouselContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 2px;
  }
`;

const TabContainer = styled.div`
  flex: 0 0 auto;
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding-left: 4px;
`;

const CategoryLabel = styled.h3`
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin: 0;
  flex: 0 0 auto;
  white-space: nowrap;
`;

const FilterTabButton = styled.button`
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--text-light);
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    border-color: var(--primary);
  }
  &::after {
    content: '▼';
    font-size: 8px;
  }
`;

const FilterDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  background: var(--dropdown-gradient); /* Updated to use gradient */
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  z-index: 1100;
  width: max-content;
  min-width: 220px;
  max-width: 400px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: var(--background);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 6px;
  border: none;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  color: var(--text);
  &:focus {
    outline: none;
    border-bottom-color: var(--primary);
  }
`;

const ItemsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
`;

interface FilterButtonProps {
  active: boolean;
  isStatic?: boolean;
}

export const FilterButton = styled(motion.button)<FilterButtonProps>`
  padding: 4px 8px;
  background: ${({ active }) => (active ? 'var(--primary)' : 'var(--button-gradient)')}; /* Updated active to solid, inactive to gradient */
  color: ${({ active }) => (active ? '#fff' : 'var(--text)')};
  border: none;
  border-radius: 16px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    background: ${({ active }) => (active ? 'var(--primary-dark)' : '#d0f0d0')};
  }
`;

const Logo = styled.img`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  object-fit: cover;
`;

const ClearButton = styled.button`
  padding: 4px 8px;
  background: var(--chip-bg);
  border: none;
  border-radius: 16px;
  color: var(--accent-red);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: #ffd0d0;
  }
`;

const EmptyMessage = styled.p`
  font-size: 11px;
  color: var(--text-light);
  margin: 6px;
  text-align: center;
`;

const FilterCategory: React.FC<FilterCategoryProps> = ({
  category,
  label,
  items,
  selectedItems,
  onFilter,
  allItems,
  displayMode,
  isSearchable = false,
  isPortal = false,
  hideTab = false,
}) => {
  const { filters, strictMode } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const filteredItems = useMemo(() => {
    let filtered = allItems;
    if (strictMode) {
      if (category === 'subcategories' && filters.selectedCategories.size > 0) {
        const allowedSubs = new Set<string>();
        filters.selectedCategories.forEach((cat: string) => {
          const subs = catToSubs.get(cat);
          if (subs) subs.forEach((sub: string) => allowedSubs.add(sub));
        });
        filtered = filtered.filter(item => allowedSubs.has(item.name));
      } else if (category === 'tags') {
        const allowedTags = new Set<string>();
        if (filters.selectedSubcategories.size > 0) {
          filters.selectedSubcategories.forEach((sub: string) => {
            const tags = subToTags.get(sub);
            if (tags) tags.forEach((tag: string) => allowedTags.add(tag));
          });
        } else if (filters.selectedCategories.size > 0) {
          filters.selectedCategories.forEach((cat: string) => {
            const subs = catToSubs.get(cat);
            if (subs) {
              subs.forEach((sub: string) => {
                const tags = subToTags.get(sub);
                if (tags) tags.forEach((tag: string) => allowedTags.add(tag));
              });
            }
          });
        }
        if (allowedTags.size > 0) {
          filtered = filtered.filter(item => allowedTags.has(item.name));
        }
      } else if (category === 'regions' && filters.selectedCountries.size > 0) {
        filtered = filtered.filter(item => {
          const country = allItems.find(i => i.name === item.name)?.value;
          return country ? filters.selectedCountries.has(country) : true;
        });
      }
    }
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [searchTerm, allItems, strictMode, filters.selectedCategories, filters.selectedSubcategories, filters.selectedCountries, category]);

  useEffect(() => {
    if (hoverSide && containerRef.current) {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = setInterval(() => {
        if (containerRef.current) {
          const scrollAmount = 50;
          containerRef.current.scrollLeft += hoverSide === 'left' ? -scrollAmount : scrollAmount;
        }
      }, 200);
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [hoverSide]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || displayMode !== 'carousel') return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const threshold = width * 0.1;
    if (mouseX <= threshold) {
      setHoverSide('left');
    } else if (mouseX >= width - threshold) {
      setHoverSide('right');
    } else {
      setHoverSide(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverSide(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterClick = (item: FilterItem) => {
    let newSelected;
    if (category === 'companies') {
      newSelected = typeof selectedItems === 'string' ? (selectedItems === item.name ? '' : item.name) : '';
      onFilter({ company: newSelected });
    } else {
      newSelected = new Set(selectedItems);
      if (newSelected.has(item.name)) {
        newSelected.delete(item.name);
      } else {
        newSelected.add(item.name);
      }
      const filterKey =
        category === 'portals' ? 'selectedPortals' :
        category === 'categories' ? 'selectedCategories' :
        category === 'subcategories' ? 'selectedSubcategories' :
        category === 'tags' ? 'selectedTags' :
        category === 'regions' ? 'selectedRegions' :
        category === 'jobTitles' ? 'selectedJobTitles' :
        category === 'modalities' ? 'selectedModalities' :
        category === 'experiences' ? 'selectedExperiences' :
        category === 'countries' ? 'selectedCountries' : '';
      if (filterKey) onFilter({ [filterKey]: newSelected });
    }
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  };

  const handleClear = () => {
    if (category === 'companies') {
      onFilter({ company: '' });
    } else {
      const filterKey =
        category === 'portals' ? 'selectedPortals' :
        category === 'categories' ? 'selectedCategories' :
        category === 'subcategories' ? 'selectedSubcategories' :
        category === 'tags' ? 'selectedTags' :
        category === 'regions' ? 'selectedRegions' :
        category === 'jobTitles' ? 'selectedJobTitles' :
        category === 'modalities' ? 'selectedModalities' :
        category === 'experiences' ? 'selectedExperiences' :
        category === 'countries' ? 'selectedCountries' : '';
      if (filterKey) onFilter({ [filterKey]: new Set() });
    }
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  };

  const isSelected = (item: FilterItem) => {
    if (category === 'companies') {
      return typeof selectedItems === 'string' && selectedItems === item.name;
    }
    return selectedItems instanceof Set && selectedItems.has(item.name);
  };

  const renderItems = () => {
    const displayItems = items.filter(item => filteredItems.some(f => f.name === item.name));
    if (displayMode === 'carousel') {
      const selected = displayItems.filter(item => isSelected(item));
      const unselected = displayItems.filter(item => !isSelected(item)).sort((a, b) => (b.count || 0) - (a.count || 0));
      const reorderedItems = [...selected, ...unselected];
      return (
        <>
          {reorderedItems.map((item, idx) => (
            <FilterButton
              key={`${item.name}-${idx}`}
              active={isSelected(item)}
              onClick={() => handleFilterClick(item)}
              role="option"
              aria-selected={isSelected(item)}
              aria-label={`Seleccionar ${item.name}`}
            >
              {item.logo && <Logo src={item.logo} alt={`${item.name} logo`} loading="lazy" />}
              {item.name} {item.count ? `(${item.count})` : ''}
            </FilterButton>
          ))}
        </>
      );
    } else if (displayMode === 'static' || displayMode === 'tabs') {
      return (
        <ItemsContainer>
          {displayItems.map((item, idx) => (
            <FilterButton
              key={`${item.name}-${idx}`}
              active={isSelected(item)}
              onClick={() => handleFilterClick(item)}
              role="option"
              aria-selected={isSelected(item)}
              aria-label={`Seleccionar ${item.name}`}
            >
              {item.logo && <Logo src={item.logo} alt={`${item.name} logo`} loading="lazy" />}
              {item.name} {item.count ? `(${item.count})` : ''}
            </FilterButton>
          ))}
        </ItemsContainer>
      );
    }
    return null;
  };

  return (
    <FilterContainer key={category}>
      <CarouselContainer ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <CategoryLabel>{label}</CategoryLabel>
        {renderItems()}
      </CarouselContainer>
      {!hideTab && (
        <TabContainer>
          <FilterTabButton
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? `Cerrar ${label} dropdown` : `Abrir ${label} dropdown`}
          >
            Más
          </FilterTabButton>
          <AnimatePresence>
            {isExpanded && (
              <FilterDropdown
                key="dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                role="listbox"
              >
                {isSearchable && (
                  <SearchInput
                    placeholder="Buscar..."
                    onChange={handleSearch}
                    aria-label={`Buscar en ${label}`}
                  />
                )}
                <ItemsContainer>
                  {filteredItems.map((item, index) => {
                    const active = isSelected(item);
                    return (
                      <FilterButton
                        key={index}
                        active={active}
                        onClick={() => handleFilterClick(item)}
                        role="option"
                        aria-selected={active}
                        aria-label={`Seleccionar ${item.name}`}
                      >
                        {item.logo && <Logo src={item.logo} alt={`${item.name} logo`} loading="lazy" />}
                        {item.name} {item.count ? `(${item.count})` : ''}
                      </FilterButton>
                    );
                  })}
                </ItemsContainer>
                {filteredItems.length === 0 && <EmptyMessage>No items encontrados.</EmptyMessage>}
              </FilterDropdown>
            )}
          </AnimatePresence>
        </TabContainer>
      )}
      {((selectedItems instanceof Set && selectedItems.size > 0) || (typeof selectedItems === 'string' && selectedItems)) && (
        <ClearButton
          onClick={handleClear}
          aria-label={`Limpiar filtros de ${label}`}
        >
          Limpiar
        </ClearButton>
      )}
    </FilterContainer>
  );
};

export default FilterCategory;