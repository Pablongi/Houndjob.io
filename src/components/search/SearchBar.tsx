import React from 'react';
import styled from 'styled-components';
import { FilterState } from 'types/filter';

const SearchBarContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 5px auto; /* Reduced margin */
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchInput = styled.input`
  padding: 8px 15px; /* Reduced padding */
  border: 1px solid var(--zhipin-border);
  border-radius: 20px;
  font-size: 15px;
  flex: 1;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  &:focus {
    border-color: var(--zhipin-teal);
    box-shadow: 0 0 5px rgba(0, 193, 222, 0.3);
  }
`;

interface SearchBarProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ filters, onFilter }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter({ search: e.target.value });
  };

  return (
    <SearchBarContainer>
      <SearchInput
        type="text"
        placeholder="Buscar empleos..."
        value={filters.search}
        onChange={handleSearchChange}
      />
    </SearchBarContainer>
  );
};

export default SearchBar;