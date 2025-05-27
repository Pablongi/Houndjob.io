import React from 'react';
import styled from 'styled-components';
import TagFilter from './TagFilter';
import CategoryFilter from './CategoryFilter';
import PortalFilter from './PortalFilter';
import SubcategoryFilter from './SubcategoryFilter';
import RegionsFilter from './RegionsFilter';
import CompaniesFilter from './CompaniesFilter';
import { FilterState } from 'types/filter';
import { Tag } from 'types/job';

const FilterPanelContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 5px 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px; /* Increased from 2px to 6px */
`;

const FilterSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

interface RankedItem {
  name: string;
  count: number;
  logo?: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  allTags: Tag[];
  allCategories: RankedItem[];
  allSubcategories: RankedItem[];
  allRegions: string[];
  topCompanies: RankedItem[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilter, allTags, allCategories, allSubcategories, allRegions, topCompanies }) => {
  // Log the number of items in each full list to debug
  console.log('FilterPanel Props - Full Lists:');
  console.log('All Tags:', allTags.length);
  console.log('All Categories:', allCategories.length);
  console.log('All Subcategories:', allSubcategories.length);
  console.log('All Regions:', allRegions.length);
  console.log('All Companies:', topCompanies.length);

  // Sort by popularity (count) before limiting for carousels
  const sortedTags = [...allTags].sort((a, b) => b.count - a.count);
  const sortedCategories = [...allCategories].sort((a, b) => b.count - a.count);
  const sortedSubcategories = [...allSubcategories].sort((a, b) => b.count - a.count);
  const sortedRegions = [...allRegions].sort((a, b) => {
    const countA = allRegions.filter(r => r === a).length;
    const countB = allRegions.filter(r => r === b).length;
    return countB - countA;
  });
  const sortedCompanies = [...topCompanies].sort((a, b) => b.count - a.count);

  // Limited arrays for carousels
  const limitedPortals = portals; // Portales: all (currently 2)
  const limitedCategories = sortedCategories.slice(0, 20); // Categorías: max 20 for carousel
  const limitedSubcategories = sortedSubcategories.slice(0, 20); // Subcategorías: max 20 for carousel
  const limitedTags = sortedTags.slice(0, 40); // Tags: max 40 for carousel
  const limitedRegions = sortedRegions; // Regiones: all for carousel
  const limitedCompanies = sortedCompanies.slice(0, 20); // Empresas: max 20 for carousel

  // Log the number of items in each limited list for comparison
  console.log('FilterPanel - Limited Lists:');
  console.log('Limited Tags:', limitedTags.length);
  console.log('Limited Categories:', limitedCategories.length);
  console.log('Limited Subcategories:', limitedSubcategories.length);
  console.log('Limited Regions:', limitedRegions.length);
  console.log('Limited Companies:', limitedCompanies.length);

  return (
    <FilterPanelContainer>
      {/* Portales (unchanged, full-width) */}
      <FilterSection>
        <PortalFilter filters={filters} onFilter={onFilter} />
      </FilterSection>
      {/* Categorías */}
      <FilterSection>
        <CategoryFilter
          filters={filters}
          onFilter={onFilter}
          allCategories={allCategories.map(item => item.name)} // Full list for dropdown
          popularCategories={limitedCategories.map(item => item.name)} // Limited for carousel
        />
      </FilterSection>
      {/* Subcategorías */}
      <FilterSection>
        <SubcategoryFilter
          filters={filters}
          onFilter={onFilter}
          allSubcategories={allSubcategories.map(item => item.name)} // Full list for dropdown
          popularSubcategories={limitedSubcategories.map(item => item.name)} // Limited for carousel
        />
      </FilterSection>
      {/* Tags */}
      <FilterSection>
        <TagFilter
          filters={filters}
          onFilter={onFilter}
          allTags={allTags} // Full list for dropdown
          popularTags={limitedTags} // Limited for carousel
        />
      </FilterSection>
      {/* Regiones */}
      <FilterSection>
        <RegionsFilter
          filters={filters}
          onFilter={onFilter}
          allRegions={allRegions} // Full list for dropdown
          popularRegions={limitedRegions} // All for carousel
        />
      </FilterSection>
      {/* Empresas */}
      <FilterSection>
        <CompaniesFilter
          filters={filters}
          onFilter={onFilter}
          allCompanies={topCompanies} // Full list for dropdown
          popularCompanies={limitedCompanies} // Limited for carousel
        />
      </FilterSection>
    </FilterPanelContainer>
  );
};

// Define portals locally since it's a small static list
const portals = [
  { name: 'Get On Board', logo: '/icon-new-c18debbaa69bac8df6158426f4a00752b32a7fba603cba4eeb3e4572466344a6.png' },
  { name: 'BNE.cl', logo: '/Logo-BNE-slogan-1.png' },
];

export default FilterPanel;