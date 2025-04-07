import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { Job } from '../types/Job';

// Interfaz para las props del componente
interface SearchBarProps {
  onSearch: (query: string) => void;
  jobs: Job[];
}

// Estilos
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px; /* Añadido para limitar el ancho en pantallas grandes */
  background: #fff;
  border-radius: 8px;
  border: 1px solid #E6E6E6; /* Borde más claro */
  padding: 8px; /* Más espacio interno */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0 auto; /* Centrado */
`;

const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  padding: 12px 16px; /* Más padding para mejor comodidad */
  width: 100%;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: #333; /* Texto más oscuro */
  &:focus {
    outline: none;
    border: 2px solid #1E90FF; /* Borde azul al enfocar */
    border-radius: 8px;
  }
  &::placeholder {
    color: #666; /* Placeholder más oscuro */
  }
`;

const SearchButton = styled.button`
  background: #1E90FF; /* Color de acento */
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px; /* Más espacio entre icono y texto */
  transition: background 0.3s, transform 0.2s;
  &:hover {
    background: #63B3ED; /* Tono más claro al hacer hover */
    transform: scale(1.05);
  }
`;

const LocationSelect = styled.select`
  padding: 12px 16px;
  border: none;
  border-right: 1px solid #E6E6E6; /* Borde más claro */
  font-size: 16px;
  color: #333; /* Texto más oscuro */
  background: transparent;
  &:focus {
    outline: none;
  }
  /* Cambia el color del texto si hay una ubicación seleccionada */
  &:not(:placeholder-shown) {
    color: #1E90FF; /* Color de acento */
  }
`;

const Suggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #E6E6E6; /* Borde más claro */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  margin: 5px 0 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 10px 12px;
  font-size: 15px; /* Aumentado para mejor legibilidad */
  color: #333; /* Texto más oscuro */
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  &:hover {
    background: #1E90FF; /* Color de acento */
    color: #fff;
  }
`;

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, jobs }) => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [location, setLocation] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value) {
      const uniqueSuggestions = Array.from(
        new Set(
          jobs
            .flatMap((job) => [job.title, job.company])
            .filter((item) => item?.toLowerCase().includes(value.toLowerCase()))
        )
      ).slice(0, 5);
      setSuggestions(uniqueSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = () => {
    setSuggestions([]);
    onSearch(query);
  };

  return (
    <SearchContainer>
      <LocationSelect
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        aria-label="Seleccionar ubicación"
      >
        <option value="">Selecciona una ubicación</option>
        <option value="Chile">Chile</option>
        <option value="Santiago">Santiago</option>
      </LocationSelect>
      <InputWrapper>
        <Input
          type="text"
          placeholder="Busca por título o empresa"
          value={query}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          aria-label="Buscar por título o empresa"
        />
        {suggestions.length > 0 && (
          <Suggestions>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch();
                }}
              >
                {suggestion}
              </SuggestionItem>
            ))}
          </Suggestions>
        )}
      </InputWrapper>
      <SearchButton onClick={handleSearch} aria-label="Buscar">
        <FaSearch size={16} /> Busca
      </SearchButton>
    </SearchContainer>
  );
};

export default SearchBar;