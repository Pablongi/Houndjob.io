// src/components/SearchBar.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaArrowRight } from 'react-icons/fa';

// Contenedor de la barra de búsqueda
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  gap: 10px;
`;

// Contenedor del input
const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

// Input de búsqueda
const Input = styled.input`
  padding: 12px 40px 12px 15px;
  width: 100%;
  border: none;
  border-radius: 20px;
  background-color: #f5f7fa;
  font-size: 16px;
  color: #333;
  &:focus {
    outline: none;
    background-color: #fff;
    box-shadow: 0 0 0 2px #00c4b4;
  }
  &::placeholder {
    color: #999;
  }
`;

// Ícono de búsqueda dentro del input
const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 15px;
  color: #999;
  font-size: 16px;
`;

// Botón de búsqueda
const SearchButton = styled.button`
  background: #00c4b4;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: #00b0a0;
  }
`;

// Botón secundario (Regístrate para ver más)
const SecondaryButton = styled.button`
  background: transparent;
  color: #00c4b4;
  border: 1px solid #00c4b4;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s, color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: #00c4b4;
    color: #fff;
  }
`;

// Contenedor de sugerencias
const Suggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  margin: 5px 0 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
`;

// Elemento de sugerencia
const SuggestionItem = styled.li`
  padding: 10px 15px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  &:hover {
    background: #f0faff;
  }
`;

const SearchBar = ({ onSearch, jobs }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    const mockSuggestions = jobs
      .flatMap(job => [job.title, job.company])
      .filter(item => item && item.toLowerCase().includes(value.toLowerCase()))
      .filter((item, index, self) => self.indexOf(item) === index)
      .slice(0, 5);
    setSuggestions(value ? mockSuggestions : []);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    onSearch({ query: suggestion });
  };

  const handleSearch = () => {
    setSuggestions([]);
    onSearch({ query });
  };

  return (
    <SearchContainer>
      <InputWrapper>
        <Input
          type="text"
          placeholder="Busca por título o empresa"
          value={query}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          aria-label="Search input"
        />
        <SearchIcon />
        {suggestions.length > 0 && (
          <Suggestions>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </SuggestionItem>
            ))}
          </Suggestions>
        )}
      </InputWrapper>
      <SearchButton onClick={handleSearch} aria-label="Search">
        Busca
      </SearchButton>
      <SecondaryButton aria-label="Regístrate para ver más">
        Regístrate para ver más <FaArrowRight />
      </SecondaryButton>
    </SearchContainer>
  );
};

export default SearchBar;