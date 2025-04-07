import React, { useState } from 'react';
import styled from 'styled-components';
import { Job } from '../types/Job';

const FilterContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 10px auto;
  padding: 8px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DynamicFiltersSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #e2e8f0;
`;

const DynamicFilterLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #1a2b49;
  margin-right: 8px;
  align-self: center;
`;

const DynamicFilterButton = styled.button`
  padding: 4px 10px;
  border: none;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  color: #1a202c;
  background: #F5F5F5;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background: #E6F0FA;
  }

  &.active {
    background: #1E90FF;
    color: white;
    transform: scale(1.05);
  }
`;

const StaticFiltersSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
`;

const StaticFilterTab = styled.div`
  position: relative;
  cursor: pointer;
`;

const StaticFilterLabel = styled.div`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #1a2b49;
  background: #edf2f7;
  border-radius: 12px;
  transition: all 0.3s ease;

  &.active {
    background: #1E90FF;
    color: white;
  }

  &:hover {
    background: #e2e8f0;
  }
`;

const StaticFilterOptions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
  min-width: 150px;
`;

const StaticFilterOption = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  color: #2d3748;
  background: #edf2f7;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
    color: #1E90FF;
  }

  &.active {
    background: #1E90FF;
    color: white;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background: #FF4D4F;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #FF7875;
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export interface Filters {
  company: string[];
  position: string[];
  modality: string[];
  experience: string[];
  salary: string[];
  timePosted: string[];
  tags: string[];
  category: string[]; // Añadido
  location: string[]; // Añadido
  remote: string[];   // Añadido
}

interface FilterTabsProps {
  onFilter: (filters: Filters) => void;
  jobs: Job[];
}

const FilterTabs: React.FC<FilterTabsProps> = ({ onFilter, jobs }) => {
  const [filters, setFilters] = useState<Filters>({
    company: [],
    position: [],
    modality: [],
    experience: [],
    salary: [],
    timePosted: [],
    tags: [],
    category: [],
    location: [],
    remote: [],
  });

  const [openStaticFilter, setOpenStaticFilter] = useState<string | null>(null);

  // Filtros dinámicos: Empresas
  const getTopCompanies = () => {
    const companyCounts: { [key: string]: number } = {};
    jobs.forEach((job) => {
      const company = job.company || 'Unknown';
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });

    return Object.entries(companyCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([company]) => company);
  };

  // Filtros dinámicos: Posiciones
  const getTopPositions = () => {
    const positionCounts: { [key: string]: number } = {};
    jobs.forEach((job) => {
      const title = job.title.toLowerCase();
      const positions = ['developer', 'engineer', 'architect', 'analyst', 'manager', 'designer', 'product manager'];
      const matchedPosition = positions.find((pos) => title.includes(pos));
      if (matchedPosition) {
        positionCounts[matchedPosition] = (positionCounts[matchedPosition] || 0) + 1;
      }
    });

    return Object.entries(positionCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([position]) => position);
  };

  const companies = getTopCompanies().length > 0 ? getTopCompanies() : [];
  const positions = getTopPositions().length > 0 ? getTopPositions() : [];

  // Filtros estáticos predefinidos
  const staticFilters = {
    modality: ['Remoto', 'Híbrido', 'Presencial'],
    experience: ['Junior', 'Mid-level', 'Senior', 'Lead', 'Manager'],
    salary: ['Menos de 2000', '2000-4000', 'Más de 4000'],
    timePosted: ['Hoy', 'Última semana', 'Último mes', 'Cualquiera'],
    languages: ['Java', 'Python', 'JavaScript', 'C#', 'Ruby', 'PHP', 'Go', 'TypeScript'],
  };

  const handleFilterToggle = (key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      const currentValues = newFilters[key];
      if (currentValues.includes(value)) {
        newFilters[key] = currentValues.filter((v) => v !== value);
      } else {
        newFilters[key] = [...currentValues, value];
      }
      onFilter(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    const resetFilters: Filters = {
      company: [],
      position: [],
      modality: [],
      experience: [],
      salary: [],
      timePosted: [],
      tags: [],
      category: [],
      location: [],
      remote: [],
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
    setOpenStaticFilter(null);
  };

  const toggleStaticFilter = (filterName: string) => {
    setOpenStaticFilter(openStaticFilter === filterName ? null : filterName);
  };

  return (
    <FilterContainer>
      <ClearButton onClick={clearFilters}>Clear filters</ClearButton>

      {/* Filtros dinámicos */}
      <DynamicFiltersSection>
        {companies.length > 0 && (
          <>
            <DynamicFilterLabel>Empresas:</DynamicFilterLabel>
            {companies.map((company) => (
              <DynamicFilterButton
                key={company}
                className={filters.company.includes(company) ? 'active' : ''}
                onClick={() => handleFilterToggle('company', company)}
              >
                {company}
              </DynamicFilterButton>
            ))}
          </>
        )}
      </DynamicFiltersSection>

      <DynamicFiltersSection>
        {positions.length > 0 && (
          <>
            <DynamicFilterLabel>Posiciones:</DynamicFilterLabel>
            {positions.map((position) => (
              <DynamicFilterButton
                key={position}
                className={filters.position.includes(position) ? 'active' : ''}
                onClick={() => handleFilterToggle('position', position)}
              >
                {position}
              </DynamicFilterButton>
            ))}
          </>
        )}
      </DynamicFiltersSection>

      {/* Filtros estáticos */}
      <StaticFiltersSection>
        {/* Modalidad */}
        <StaticFilterTab>
          <StaticFilterLabel
            className={openStaticFilter === 'modality' ? 'active' : ''}
            onClick={() => toggleStaticFilter('modality')}
          >
            Modalidad
          </StaticFilterLabel>
          {openStaticFilter === 'modality' && (
            <StaticFilterOptions>
              {staticFilters.modality.map((option) => (
                <StaticFilterOption
                  key={option}
                  className={filters.modality.includes(option) ? 'active' : ''}
                  onClick={() => handleFilterToggle('modality', option)}
                >
                  {option}
                </StaticFilterOption>
              ))}
            </StaticFilterOptions>
          )}
        </StaticFilterTab>

        {/* Experiencia */}
        <StaticFilterTab>
          <StaticFilterLabel
            className={openStaticFilter === 'experience' ? 'active' : ''}
            onClick={() => toggleStaticFilter('experience')}
          >
            Experiencia
          </StaticFilterLabel>
          {openStaticFilter === 'experience' && (
            <StaticFilterOptions>
              {staticFilters.experience.map((option) => (
                <StaticFilterOption
                  key={option}
                  className={filters.experience.includes(option) ? 'active' : ''}
                  onClick={() => handleFilterToggle('experience', option)}
                >
                  {option}
                </StaticFilterOption>
              ))}
            </StaticFilterOptions>
          )}
        </StaticFilterTab>

        {/* Sueldo */}
        <StaticFilterTab>
          <StaticFilterLabel
            className={openStaticFilter === 'salary' ? 'active' : ''}
            onClick={() => toggleStaticFilter('salary')}
          >
            Sueldo
          </StaticFilterLabel>
          {openStaticFilter === 'salary' && (
            <StaticFilterOptions>
              {staticFilters.salary.map((option) => (
                <StaticFilterOption
                  key={option}
                  className={filters.salary.includes(option) ? 'active' : ''}
                  onClick={() => handleFilterToggle('salary', option)}
                >
                  {option}
                </StaticFilterOption>
              ))}
            </StaticFilterOptions>
          )}
        </StaticFilterTab>

        {/* Tiempo Publicado */}
        <StaticFilterTab>
          <StaticFilterLabel
            className={openStaticFilter === 'timePosted' ? 'active' : ''}
            onClick={() => toggleStaticFilter('timePosted')}
          >
            Tiempo Publicado
          </StaticFilterLabel>
          {openStaticFilter === 'timePosted' && (
            <StaticFilterOptions>
              {staticFilters.timePosted.map((option) => (
                <StaticFilterOption
                  key={option}
                  className={filters.timePosted.includes(option) ? 'active' : ''}
                  onClick={() => handleFilterToggle('timePosted', option)}
                >
                  {option}
                </StaticFilterOption>
              ))}
            </StaticFilterOptions>
          )}
        </StaticFilterTab>

        {/* Lenguajes */}
        <StaticFilterTab>
          <StaticFilterLabel
            className={openStaticFilter === 'languages' ? 'active' : ''}
            onClick={() => toggleStaticFilter('languages')}
          >
            Lenguajes
          </StaticFilterLabel>
          {openStaticFilter === 'languages' && (
            <StaticFilterOptions>
              {staticFilters.languages.map((option) => (
                <StaticFilterOption
                  key={option}
                  className={filters.tags.includes(option) ? 'active' : ''}
                  onClick={() => handleFilterToggle('tags', option)}
                >
                  {option}
                </StaticFilterOption>
              ))}
            </StaticFilterOptions>
          )}
        </StaticFilterTab>
      </StaticFiltersSection>
    </FilterContainer>
  );
};

export default FilterTabs;