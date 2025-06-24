import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { FilterState } from '../../types/filter';

// Importar estilos de slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CategoryContainer = styled(motion.div)`
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
  background: var(--background-secondary, #f8f9fa);
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CategoryLabel = styled.h3`
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  color: var(--text, #333);
`;

const ExpandButton = styled(motion.button)`
  background: none;
  border: none;
  font-size: 14px;
  color: var(--zhipin-teal);
  cursor: pointer;
  &:hover {
    color: var(--zhipin-teal-dark);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--border, #e8ecef);
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  color: var(--text, #333);
  background: var(--background-panel, #fff);
  &:focus {
    outline: none;
    border-color: var(--zhipin-teal);
    box-shadow: 0 0 0 2px rgba(0, 193, 222, 0.2);
  }
`;

const ItemsContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CarouselContainer = styled.div`
  margin-top: 8px;
  .slick-slide {
    padding: 0 4px;
  }
  .slick-prev,
  .slick-next {
    background: var(--chip-bg, #e8ecef);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    z-index: 1;
    &:before {
      color: var(--text-light, #666);
      font-size: 14px;
    }
    &:hover {
      background: #d0d5dd;
    }
  }
  .slick-prev {
    left: -30px;
  }
  .slick-next {
    right: -30px;
  }
`;

interface FilterButtonProps {
  active: boolean;
  isTopTag?: boolean;
}

const FilterButton = styled(motion.button)<FilterButtonProps>`
  padding: 6px 12px;
  background: ${({ active }) => (active ? '#00c4b4' : 'var(--chip-bg, #e8ecef)')};
  color: ${({ active }) => (active ? '#fff' : 'var(--text-light, #666)')};
  border: 1px solid ${({ active }) => (active ? '#00c4b4' : 'var(--border, #e8ecef)')};
  border-radius: 16px;
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
  &:hover {
    background: ${({ active }) => (active ? '#00a89a' : '#d0d5dd')};
    color: ${({ active }) => (active ? '#fff' : 'var(--text, #333)')};
  }
  &:focus {
    outline: 2px solid #00c4b4;
    outline-offset: 2px;
  }
`;

const Logo = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
`;

const Count = styled.span`
  font-size: 12px;
  color: var(--text-light, #666);
`;

const ClearButton = styled(motion.button)`
  padding: 4px 8px;
  background: var(--background-panel, #fff);
  border: 1px solid var(--border, #e8ecef);
  border-radius: 8px;
  color: var(--text, #333);
  font-size: 12px;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
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

const EmptyMessage = styled.p`
  font-size: 14px;
  color: var(--text-light, #666);
  font-family: 'Roboto', sans-serif;
  margin: 8px 0;
`;

const LoadMoreButton = styled(motion.button)`
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--chip-bg, #e8ecef);
  border: 1px solid var(--border, #e8ecef);
  border-radius: 8px;
  color: var(--text-light, #666);
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: #d0d5dd;
    color: var(--text, #333);
  }
  &:focus {
    outline: 2px solid #00c4b4;
  }
`;

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
  displayMode: 'rows' | 'tabs';
  isSearchable?: boolean;
  isPortal?: boolean;
}

const FilterCategory: React.FC<FilterCategoryProps> = ({
  category,
  label,
  items,
  selectedItems,
  onFilter,
  allItems,
  displayMode,
  isSearchable,
  isPortal,
}) => {
  const [isExpanded, setIsExpanded] = useState(displayMode === 'rows');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<FilterItem[]>(items);
  const [visibleItemsCount, setVisibleItemsCount] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: Math.min(items.length, 5),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(items.length, 4),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(items.length, 3),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(items.length, 2),
        },
      },
    ],
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
  };

  useEffect(() => {
    if (!isSearchable) {
      setFilteredItems(items);
      return;
    }

    if (!searchTerm) {
      setFilteredItems(items);
      return;
    }

    const filtered = allItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items, allItems, isSearchable]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setVisibleItemsCount(10);
  };

  const handleFilterClick = (item: FilterItem) => {
    if (isDragging) return;

    if (category === 'companies') {
      const currentCompany = typeof selectedItems === 'string' ? selectedItems : '';
      const newCompany = currentCompany === item.name ? '' : item.name;
      onFilter({ company: newCompany });
    } else {
      const newSelected = new Set(
        selectedItems instanceof Set ? selectedItems : new Set([selectedItems])
      );
      if (newSelected.has(item.name)) {
        newSelected.delete(item.name);
      } else {
        newSelected.add(item.name);
      }

      const filterKey =
        category === 'portals'
          ? 'selectedPortals'
          : category === 'categories'
          ? 'selectedCategories'
          : category === 'tags'
          ? 'selectedTags'
          : 'selectedRegions';

      onFilter({ [filterKey]: newSelected });
    }
  };

  const handleClear = () => {
    if (category === 'companies') {
      onFilter({ company: '' });
    } else {
      const filterKey =
        category === 'portals'
          ? 'selectedPortals'
          : category === 'categories'
          ? 'selectedCategories'
          : category === 'tags'
          ? 'selectedTags'
          : 'selectedRegions';
      onFilter({ [filterKey]: new Set() });
    }
  };

  const loadMore = () => {
    setVisibleItemsCount((prev) => prev + 10);
  };

  const isSelected = (item: FilterItem) => {
    if (category === 'companies') {
      return typeof selectedItems === 'string' && selectedItems === item.name;
    }
    return selectedItems instanceof Set && selectedItems.has(item.name);
  };

  const getCount = (item: FilterItem) => {
    return item.count !== undefined ? ` (${item.count})` : '';
  };

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const visibleItems = isSearchable
    ? filteredItems.slice(0, visibleItemsCount)
    : filteredItems;

  const hasMoreItems = isSearchable && visibleItemsCount < filteredItems.length;

  const isEmpty = filteredItems.length === 0;

  return (
    <CategoryContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="group"
      aria-label={`${label} filter category`}
    >
      <CategoryHeader>
        <CategoryLabel>{label}</CategoryLabel>
        {displayMode === 'tabs' && !isSearchable && (
          <ExpandButton
            onClick={handleExpand}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </ExpandButton>
        )}
        {((selectedItems instanceof Set && selectedItems.size > 0) ||
          (typeof selectedItems === 'string' && selectedItems)) && (
          <ClearButton
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95}}
            aria-label={`Clear ${label} filters`}
          >
            <span>✕</span> Clear
          </ClearButton>
        )}
      </CategoryHeader>
      {isSearchable && (
        <SearchInput
          type="text"
          placeholder={`Search ${label}...`}
          value={searchTerm}
          onChange={handleSearch}
          aria-label={`Search ${label}`}
        />
      )}
      {isEmpty && <EmptyMessage>No items found.</EmptyMessage>}
      {!isEmpty && !isExpanded && displayMode === 'tabs' && !isSearchable ? (
        <CarouselContainer>
          <Slider {...sliderSettings}>
            {filteredItems.map((item, idx) => (
              <FilterButton
                key={idx}
                active={isSelected(item)}
                onClick={() => handleFilterClick(item)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Filter by ${item.name}`}
                aria-pressed={isSelected(item)}
              >
                {isPortal && item.logo && (
                  <Logo src={item.logo} alt={`${item.name} logo`} onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
                {item.name}
                {getCount(item)}
              </FilterButton>
            ))}
          </Slider>
        </CarouselContainer>
      ) : (
        !isEmpty && (
          <ItemsContainer>
            {visibleItems.map((item, idx) => {
              const key = `${item.name}-${item.count || idx}`;
              const isActive = isSelected(item);
              const itemLabel = `${item.name}${getCount(item)}`;
              const normalizedLabel = itemLabel.toLowerCase();
              const normalizedCount = parseInt(normalizedLabel.match(/\d+/)?.[0] || '0', 10);
              const normalizedName = normalizedLabel.replace(/\s*\(\d+\)\s*$/, '');
              const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
              const matchesSearch =
                searchWords.length === 0 ||
                searchWords.every(
                  (word) =>
                    normalizedName.includes(word) || normalizedCount.toString().includes(word)
                );

              const score =
                searchWords.reduce((acc, word) => {
                  const nameScore = normalizedName.includes(word) ? word.length * 2 : 0;
                  const countScore = normalizedCount.toString().includes(word) ? word.length : 0;
                  return acc + nameScore + countScore;
                }, 0) + (isActive ? 100 : 0);

              if (!matchesSearch) return null;

              return (
                <FilterButton
                  key={key}
                  active={isActive}
                  onClick={() => handleFilterClick(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ order: -score }}
                  aria-label={`Filter by ${item.name}`}
                  aria-pressed={isActive}
                >
                  {isPortal && item.logo && (
                    <Logo src={item.logo} alt={`${item.name} logo`} onError={(e) => (e.currentTarget.style.display = 'none')} />
                  )}
                  {item.name}
                  {item.count !== undefined && <Count>({item.count})</Count>}
                </FilterButton>
              );
            })}
          </ItemsContainer>
        )
      )}
      {hasMoreItems && (
        <LoadMoreButton
          onClick={loadMore}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Load more ${label} items`}
        >
          Load More
        </LoadMoreButton>
      )}
    </CategoryContainer>
  );
};

export default FilterCategory;