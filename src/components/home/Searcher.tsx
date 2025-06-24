import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SearchBarProps } from '../../types/interfaces';
import { Tag } from '../../types/job';
import { RankedItem } from '../../types/filter';



const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--border, #d9d9d9);
  border-radius: 4px;
  padding: 5px;
  background: var(--background, #fff);
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 8px;
  font-size: 16px;
  color: var(--text, #333);
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: var(--text-light, #999);
  cursor: pointer;
  padding: 5px;
  font-size: 14px;
  &:hover {
    color: var(--text, #333);
  }
`;

const ResetButton = styled.button`
  background: var(--primary, #007bff);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: var(--primary-hover, #0056b3);
  }
`;

const SuggestionsContainer = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--background, #fff);
  border: 1px solid var(--border, #d9d9d9);
  border-radius: 4px;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  z-index: 1000;
`;

const SuggestionItem = styled.li<{ active: boolean }>`
  padding: 10px;
  cursor: pointer;
  background: ${(props) => (props.active ? 'var(--background-hover, #f0f0f0)' : 'transparent')};
  &:hover {
    background: var(--background-hover, #f0f0f0);
  }
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  background: var(--background-secondary, #e9ecef);
  border-radius: 12px;
  padding: 5px 10px;
  font-size: 14px;
  color: var(--text, #333);
`;

const ChipLabel = styled.span`
  margin-right: 5px;
`;

const RemoveChipButton = styled.button`
  background: none;
  border: none;
  color: var(--text-light, #999);
  cursor: pointer;
  font-size: 12px;
  &:hover {
    color: var(--text, #333);
  }
`;

interface ChipData {
  type: string;
  value: string;
}

const Searcher: React.FC<SearchBarProps> = ({
  filters,
  onFilter,
  onReset,
  allTags,
  allCategories,
  allSubcategories,
  allRegions,
  topCompanies,
  topTags = [],
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(filters.search);
  const [suggestions, setSuggestions] = useState<ChipData[]>([]);
  const [chips, setChips] = useState<ChipData[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const newSuggestions: ChipData[] = [];

      allRegions.forEach((region: string) => {
        if (region.toLowerCase().includes(searchTerm.toLowerCase())) {
          newSuggestions.push({ type: 'region', value: region });
        }
      });

      if (newSuggestions.length > 5) {
        setSuggestions(newSuggestions.slice(0, 5));
      } else {
        allTags.forEach((tag: Tag) => {
          if (tag.tag.toLowerCase().includes(searchTerm.toLowerCase())) {
            newSuggestions.push({ type: 'tag', value: tag.tag });
          }
        });

        allCategories.forEach((category: RankedItem) => {
          if (category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            newSuggestions.push({ type: 'category', value: category.name });
          }
        });

        allSubcategories.forEach((subcategory: RankedItem) => {
          if (subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            newSuggestions.push({ type: 'subcategory', value: subcategory.name });
          }
        });

        topCompanies.forEach((company: RankedItem) => {
          if (company.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            newSuggestions.push({ type: 'company', value: company.name });
          }
        });

        setSuggestions(newSuggestions.slice(0, 5));
      }

      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, allTags, allCategories, allSubcategories, allRegions, topCompanies]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm) {
      if (highlightedIndex >= 0 && suggestions.length > 0) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        onFilter({ search: searchTerm });
        setSearchTerm('');
        setShowSuggestions(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: ChipData) => {
    const updatedChips = [...chips];
    if (suggestion.type === 'tag') {
      updatedChips.push({ type: 'tag', value: suggestion.value });
      const updatedTags = new Set(filters.selectedTags);
      updatedTags.add(suggestion.value);
      onFilter({ selectedTags: updatedTags });
    } else if (suggestion.type === 'category') {
      updatedChips.push({ type: 'category', value: suggestion.value });
      const updatedCategories = new Set(filters.selectedCategories);
      updatedCategories.add(suggestion.value);
      onFilter({ selectedCategories: updatedCategories });
    } else if (suggestion.type === 'subcategory') {
      updatedChips.push({ type: 'subcategory', value: suggestion.value });
      const updatedSubcategories = new Set(filters.selectedSubcategories);
      updatedSubcategories.add(suggestion.value);
      onFilter({ selectedSubcategories: updatedSubcategories });
    } else if (suggestion.type === 'region') {
      updatedChips.push({ type: 'region', value: suggestion.value });
      const updatedRegions = new Set(filters.selectedRegions);
      updatedRegions.add(suggestion.value);
      onFilter({ selectedRegions: updatedRegions });
    } else if (suggestion.type === 'company') {
      onFilter({ company: suggestion.value });
    }

    setChips(updatedChips);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveChip = (index: number) => {
    const chipToRemove = chips[index];
    const updatedChips = chips.filter((_, idx) => idx !== index);
    setChips(updatedChips);

    if (chipToRemove.type === 'tag') {
      const updatedTags = new Set(filters.selectedTags);
      updatedTags.delete(chipToRemove.value);
      onFilter({ selectedTags: updatedTags });
    } else if (chipToRemove.type === 'category') {
      const updatedCategories = new Set(filters.selectedCategories);
      updatedCategories.delete(chipToRemove.value);
      onFilter({ selectedCategories: updatedCategories });
    } else if (chipToRemove.type === 'subcategory') {
      const updatedSubcategories = new Set(filters.selectedSubcategories);
      updatedSubcategories.delete(chipToRemove.value);
      onFilter({ selectedSubcategories: updatedSubcategories });
    } else if (chipToRemove.type === 'region') {
      const updatedRegions = new Set(filters.selectedRegions);
      updatedRegions.delete(chipToRemove.value);
      onFilter({ selectedRegions: updatedRegions });
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onFilter({ search: '' });
    setShowSuggestions(false);
  };

  const handleReset = () => {
    setChips([]);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    onReset();
  };

  return (
    <SearchContainer>
      <SearchInputWrapper>
        <SearchInput
          ref={inputRef}
          type="text"
          placeholder="Search jobs by keyword, company, or location..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {searchTerm && <ClearButton onClick={handleClearSearch}>Clear</ClearButton>}
        <ResetButton onClick={handleReset}>Reset Filters</ResetButton>
      </SearchInputWrapper>
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsContainer>
          {suggestions.map((suggestion, idx) => (
            <SuggestionItem
              key={`${suggestion.type}-${suggestion.value}-${idx}`}
              active={idx === highlightedIndex}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.type}: {suggestion.value}
            </SuggestionItem>
          ))}
        </SuggestionsContainer>
      )}
      {chips.length > 0 && (
        <ChipsContainer>
          {chips.map((chip, idx) => (
            <Chip key={`${chip.type}-${chip.value}-${idx}`}>
              <ChipLabel>{chip.type}: {chip.value}</ChipLabel>
              <RemoveChipButton onClick={() => handleRemoveChip(idx)}>✕</RemoveChipButton>
            </Chip>
          ))}
        </ChipsContainer>
      )}
    </SearchContainer>
  );
};

export default Searcher;