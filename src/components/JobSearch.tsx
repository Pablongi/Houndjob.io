import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Job } from '../types/Job';
import { motion } from 'framer-motion';
import { TAG_CATEGORIES } from '../service/TagsService';

interface FilterState {
  search: string;
  tags: Set<string>;
}

interface JobSearchProps {
  jobs: Job[];
  onFilter: (filters: FilterState) => void;
  activeFilters: FilterState;
}

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const TopRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 20px;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const SearchBar = styled(motion.div)`
  flex: 1;
  display: flex;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  transition: background 0.2s ease;
  &:focus-within {
    background: #fff;
    box-shadow: 0 0 0 2px #00c1de;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled(motion.input)`
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
  &::placeholder {
    color: #999;
  }
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const TagSection = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 0;
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const TagButton = styled(motion.button)<{ active: boolean }>`
  padding: 6px 12px;
  background: ${(props) => (props.active ? '#00c1de' : '#f5f5f5')};
  color: ${(props) => (props.active ? '#fff' : '#333')};
  border: 1px solid ${(props) => (props.active ? '#00c1de' : '#ddd')};
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${(props) => (props.active ? '#00a1be' : '#e0e0e0')};
  }
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 5px 10px;
  }
`;

const FilterRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px 0;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FilterCategory = styled(motion.div)`
  padding: 15px;
  background: #fff;
  border: 1px solid #e8ecef;
  border-radius: 6px;
  min-width: 220px;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 193, 222, 0.1);
  }
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterOption = styled(motion.button)<{ active: boolean }>`
  padding: 6px 12px;
  background: ${(props) => (props.active ? '#00c1de' : '#f5f5f5')};
  color: ${(props) => (props.active ? '#fff' : '#333')};
  border: 1px solid ${(props) => (props.active ? '#00c1de' : '#ddd')};
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${(props) => (props.active ? '#00a1be' : '#e0e0e0')};
  }
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 5px 10px;
  }
`;

const JobSearch: React.FC<JobSearchProps> = ({ jobs, onFilter, activeFilters }) => {
  const [filters, setFilters] = useState<FilterState>(activeFilters);

  const getTopTags = () => {
    const tagCount: { [key: string]: number } = {};
    jobs.forEach((job) => {
      job.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag);
  };

  const getTopCompanies = () => {
    const companyCount: { [key: string]: number } = {};
    jobs.forEach((job) => {
      companyCount[job.company] = (companyCount[job.company] || 0) + 1;
    });
    return Object.entries(companyCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([company]) => company);
  };

  const getTopCategories = () => {
    const categoryCount: { [key: string]: number } = {};
    jobs.forEach((job) => {
      job.tags.forEach((tag) => {
        for (const { categoría, subcategorías } of TAG_CATEGORIES) {
          for (const [, tags] of Object.entries(subcategorías)) {
            if ((tags as string[]).includes(tag)) {
              categoryCount[categoría] = (categoryCount[categoría] || 0) + 1;
              break;
            }
          }
        }
      });
    });
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  };

  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  const topTags = getTopTags();
  const topCompanies = getTopCompanies();
  const topCategories = getTopCategories();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const toggleFilter = (value: string) => {
    const newTags = new Set(filters.tags);
    if (newTags.has(value)) newTags.delete(value);
    else newTags.add(value);
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <Container className="animate__animated animate__fadeIn">
      <TopRow
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SearchBar
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SearchInput
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search jobs or companies..."
            whileFocus={{ scale: 1.02 }}
          />
        </SearchBar>
      </TopRow>
      <TagSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {topTags.length > 0 ? (
          topTags.map((tag) => (
            <TagButton
              key={tag}
              active={filters.tags.has(tag)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleFilter(tag)}
            >
              #{tag}
            </TagButton>
          ))
        ) : (
          <div>No tags available</div>
        )}
      </TagSection>
      <FilterRow
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <FilterCategory>
          <FilterLabel>Top Categories</FilterLabel>
          <FilterOptions>
            {topCategories.map((category) => (
              <FilterOption
                key={category}
                active={filters.tags.has(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleFilter(category)}
              >
                {category}
              </FilterOption>
            ))}
          </FilterOptions>
        </FilterCategory>
        <FilterCategory>
          <FilterLabel>Popular Companies</FilterLabel>
          <FilterOptions>
            {topCompanies.map((company) => (
              <FilterOption
                key={company}
                active={filters.tags.has(company)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleFilter(company)}
              >
                {company}
              </FilterOption>
            ))}
          </FilterOptions>
        </FilterCategory>
      </FilterRow>
    </Container>
  );
};

export default JobSearch;