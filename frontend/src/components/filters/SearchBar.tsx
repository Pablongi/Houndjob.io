import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAppContext } from './FilterContext';
import { Job, Tag } from '@/types/job';
import { FilterState } from '@/types/filter';
import { normalizeText } from '@/logic/filterUtils';

const SearchWrapper = styled.div`
  max-width: 100%;
  position: relative;
  width: 100%;
  box-sizing: border-box;
`;

const SearchForm = styled.form`
  position: relative;
`;

const SearchInputWrapper = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 140px 0 48px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  background: var(--background);
  box-shadow: var(--shadow);
  box-sizing: border-box;
  &:focus {
    box-shadow: 0 0 0 2px var(--primary);
  }
  &::placeholder {
    color: var(--text-light);
  }
  @media (max-width: 768px) {
    height: 44px;
    padding: 0 110px 0 40px;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  font-size: 20px;
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--button-gradient); /* Updated to use gradient */
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
  &:hover {
    background: var(--primary-dark);
  }
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  width: 100%;
  background: var(--dropdown-gradient); /* Updated to use gradient */
  border-radius: 8px;
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: var(--shadow);
  margin-top: 4px;
`;

const SuggestionItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  &:hover {
    background: var(--chip-bg);
  }
`;

function levenshteinDistance(s: string, t: string): number {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr: number[][] = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] = i === 0 ? j : Math.min(
        arr[i - 1][j] + 1,
        arr[i][j - 1] + 1,
        arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
      );
    }
  }
  return arr[t.length][s.length];
}

interface SearchBarProps {
  allJobs: Job[];
}

const SearchBar: React.FC<SearchBarProps> = ({ allJobs }) => {
  const { filters, setFilters } = useAppContext();
  const [searchTerm, setSearchTerm] = useState<string>(filters.search);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  const allTerms = useMemo(() => {
    const terms = new Set<string>();
    allJobs.forEach(job => {
      terms.add(job.attributes.title);
      terms.add(job.attributes.company);
      job.tags.forEach((tag: Tag) => terms.add(tag.tag));
    });
    return Array.from(terms);
  }, [allJobs]);

  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    const normalizedSearch = normalizeText(searchTerm);
    let matches = allTerms.filter((term: string) => normalizeText(term).includes(normalizedSearch));
    if (matches.length < 8) {
      const closest = allTerms
        .map((term: string) => ({ term, dist: levenshteinDistance(normalizedSearch, normalizeText(term)) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 8 - matches.length)
        .map(({ term }) => term);
      matches = [...new Set([...matches, ...closest])].slice(0, 8);
    } else {
      matches = matches.slice(0, 8);
    }
    return matches;
  }, [searchTerm, allTerms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      setFilters((prev: FilterState) => ({ ...prev, search: newValue }));
      setShowSuggestions(!!newValue);
    }, 300);
    setDebounceTimeout(timeout);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFilters((prev: FilterState) => ({ ...prev, search: searchTerm }));
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error en handleSearchSubmit:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setFilters((prev: FilterState) => ({ ...prev, search: suggestion }));
    setShowSuggestions(false);
  };

  return (
    <div role="search" aria-label="Barra de búsqueda">
      <SearchWrapper>
        <SearchForm onSubmit={handleSearchSubmit}>
          <SearchInputWrapper>
            <SearchInput
              placeholder="Ingresa el tipo de empleo (ej: desarrollador, marketing)"
              value={searchTerm}
              onChange={handleInputChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => setShowSuggestions(!!searchTerm)}
              aria-label="Buscar empleos"
              aria-autocomplete="list"
            />
            <SearchIcon>🔍</SearchIcon>
          </SearchInputWrapper>
          {showSuggestions && suggestions.length > 0 && (
            <SuggestionsContainer role="listbox" aria-label="Sugerencias de búsqueda">
              {suggestions.map((suggestion: string, index: number) => (
                <SuggestionItem
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="option"
                  aria-selected={searchTerm === suggestion}
                >
                  {suggestion}
                </SuggestionItem>
              ))}
            </SuggestionsContainer>
          )}
          <SearchButton type="submit" aria-label="Buscar">
            Buscar
          </SearchButton>
        </SearchForm>
      </SearchWrapper>
    </div>
  );
};

export default SearchBar;