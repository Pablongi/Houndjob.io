import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Paleta de colores
const colors = {
  glacier: '#79b2c6',
  elephant: '#0c263b',
  blueBayoux: '#4c6877',
  raven: '#717d89',
  riverBed: '#404e59',
  slateGray: '#7b8c94',
  horizon: '#55849c',
  rhino: '#294656',
  sanJuan: '#30546c',
};

// Contenedor principal de los filtros
const FilterContainer = styled.div`
  margin: 20px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 10vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Sección de filtros de tags (botones flotantes)
const TagFilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// Botón de tag
const TagButton = styled.button`
  background: ${(props) => (props.active ? colors.glacier : '#e0e8f0')};
  color: ${(props) => (props.active ? '#fff' : colors.raven)};
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  &:hover {
    background: ${colors.horizon};
    color: #fff;
  }
`;

// Sección de filtros presionables (botones con fondo pálido)
const PressableFilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

// Botón presionable
const PressableButton = styled.button`
  background: ${(props) => (props.active ? colors.glacier : '#f0f4f8')};
  color: ${(props) => (props.active ? '#fff' : colors.sanJuan)};
  border: 1px solid ${colors.slateGray};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  &:hover {
    background: ${colors.horizon};
    color: #fff;
  }
`;

// Sección de filtros modo cinta
const RibbonFilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// Botón modo cinta
const RibbonButton = styled.button`
  background: ${(props) => (props.active ? colors.glacier : '#f5f7fa')};
  color: ${(props) => (props.active ? '#fff' : colors.raven)};
  border: 1px solid ${colors.slateGray};
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  &:hover {
    background: ${colors.horizon};
    color: #fff;
  }
`;

const FilterTabs = ({ onFilter, jobs }) => {
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    modality: '',
    seniority: '',
    location: '',
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [seniorities, setSeniorities] = useState([]);
  const [locations, setLocations] = useState([]);

  // Extraer datos dinámicos de los trabajos
  useEffect(() => {
    if (!jobs || !Array.isArray(jobs)) {
      console.log('No jobs data available for filters');
      return;
    }

    // Categorías
    const rawCategories = jobs.map(job => job.category);
    console.log('Categorías crudas:', rawCategories);
    const uniqueCategories = [...new Set(rawCategories.filter(cat => cat))]; // Eliminamos solo los valores falsy
    console.log('Categorías únicas:', uniqueCategories);
    setCategories(uniqueCategories);

    // Etiquetas (tags)
    const rawTags = jobs.flatMap(job => job.descriptionTags || []);
    console.log('Etiquetas crudas:', rawTags);
    const uniqueTags = [...new Set(rawTags.filter(tag => tag))]; // Eliminamos solo los valores falsy
    console.log('Etiquetas únicas:', uniqueTags);
    setTags(uniqueTags);

    // Modalidades
    const rawModalities = jobs.map(job => job.modality);
    console.log('Modalidades crudas:', rawModalities);
    const uniqueModalities = [...new Set(rawModalities.filter(mod => mod))]; // Eliminamos solo los valores falsy
    console.log('Modalidades únicas:', uniqueModalities);
    setModalities(uniqueModalities);

    // Seniorities
    const rawSeniorities = jobs.map(job => job.experienceLevel);
    console.log('Seniorities crudas:', rawSeniorities);
    const uniqueSeniorities = [...new Set(rawSeniorities.filter(sen => sen))]; // Eliminamos solo los valores falsy
    console.log('Seniorities únicas:', uniqueSeniorities);
    setSeniorities(uniqueSeniorities);

    // Ubicaciones
    const rawLocations = jobs.map(job => job.location);
    console.log('Ubicaciones crudas:', rawLocations);
    const uniqueLocations = [...new Set(rawLocations.filter(loc => loc))]; // Eliminamos solo los valores falsy
    console.log('Ubicaciones únicas:', uniqueLocations);
    setLocations(uniqueLocations);
  }, [jobs]);

  const handleTagFilter = (type, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [type]: prev[type] === value ? '' : value };
      onFilter(newFilters);
      return newFilters;
    });
  };

  const handlePressableFilter = (type, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [type]: prev[type] === value ? '' : value };
      onFilter(newFilters);
      return newFilters;
    });
  };

  const handleRibbonFilter = (type, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [type]: prev[type] === value ? '' : value };
      onFilter(newFilters);
      return newFilters;
    });
  };

  return (
    <FilterContainer>
      {/* Parte superior: Filtros de tags (categorías y etiquetas) */}
      {categories.length > 0 || tags.length > 0 ? (
        <TagFilterSection>
          {categories.map((category) => (
            <TagButton
              key={category}
              active={filters.category === category}
              onClick={() => handleTagFilter('category', category)}
            >
              {category}
            </TagButton>
          ))}
          {tags.map((tag) => (
            <TagButton
              key={tag}
              active={filters.tag === tag}
              onClick={() => handleTagFilter('tag', tag)}
            >
              {tag}
            </TagButton>
          ))}
        </TagFilterSection>
      ) : (
        <p style={{ color: colors.raven, fontSize: '12px' }}>No hay categorías ni etiquetas disponibles.</p>
      )}

      {/* Parte media: Filtros presionables (modality, experience level) */}
      <PressableFilterSection>
        {modalities.length > 0 ? (
          modalities.map((modality) => (
            <PressableButton
              key={modality}
              active={filters.modality === modality}
              onClick={() => handlePressableFilter('modality', modality)}
            >
              {modality}
            </PressableButton>
          ))
        ) : (
          <p style={{ color: colors.raven, fontSize: '12px' }}>No hay modalidades disponibles.</p>
        )}
        {seniorities.length > 0 ? (
          seniorities.map((seniority) => (
            <PressableButton
              key={seniority}
              active={filters.seniority === seniority}
              onClick={() => handlePressableFilter('seniority', seniority)}
            >
              {seniority}
            </PressableButton>
          ))
        ) : (
          <p style={{ color: colors.raven, fontSize: '12px' }}>No hay niveles de experiencia disponibles.</p>
        )}
      </PressableFilterSection>

      {/* Parte inferior: Filtros modo cinta (location) */}
      {locations.length > 0 ? (
        <RibbonFilterSection>
          {locations.map((location) => (
            <RibbonButton
              key={location}
              active={filters.location === location}
              onClick={() => handleRibbonFilter('location', location)}
            >
              {location}
            </RibbonButton>
          ))}
        </RibbonFilterSection>
      ) : (
        <p style={{ color: colors.raven, fontSize: '12px' }}>No hay ubicaciones disponibles.</p>
      )}
    </FilterContainer>
  );
};

export default FilterTabs;