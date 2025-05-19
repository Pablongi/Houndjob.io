import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Job } from '../types/Job';
import { motion } from 'framer-motion';
import { TAG_CATEGORIES } from '../service/TagsService';
import JobsService from '../service/JobsService';

interface FilterState {
  search: string;
  tags: Set<string>;
  company: string | null;
  portal: string | null;
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
  gap: 20px;
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  padding-bottom: 5px;
  border-bottom: 1px solid #00c1de;
`;

const PortalFilterContainer = styled(motion.div)`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const PortalButton = styled(motion.button)<{ active: boolean }>`
  width: 100px;
  height: 30px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: ${(props) => (props.active ? '#e0f7fa' : '#f5f5f5')};
  border: 1px solid ${(props) => (props.active ? '#00c1de' : '#ddd')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${(props) => (props.active ? '#b2ebf2' : '#e0e0e0')};
  }
  &.bne {
    background-image: url('/Logo-BNE-slogan-1.png');
  }
  &.getonboard {
    background-image: url('/icon-new-c18debbaa69bac8df6158426f4a00752b32a7fba603cba4eeb3e4572466344a6.png');
  }
  @media (max-width: 768px) {
    width: 80px;
    height: 25px;
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
  padding: 12px;
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
  font-size: 16px;
  color: #333;
  outline: none;
  &::placeholder {
    color: #999;
  }
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const SearchButton = styled(motion.button)`
  padding: 8px 15px;
  background: #00c1de;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 16px;
  transition: background 0.2s ease;
  &:hover {
    background: #00a1be;
  }
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 14px;
    margin-left: 0;
    margin-top: 5px;
  }
`;

const FilterRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 10px 0;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FilterCategory = styled(motion.div)`
  padding: 20px;
  background: #fff;
  border: 1px solid #e8ecef;
  border-radius: 6px;
  min-width: 250px;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 193, 222, 0.1);
  }
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterOption = styled(motion.button)<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: ${(props) => (props.active ? '#00c1de' : '#f5f5f5')};
  color: ${(props) => (props.active ? '#fff' : '#333')};
  border: 1px solid ${(props) => (props.active ? '#00c1de' : '#ddd')};
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${(props) => (props.active ? '#00a1be' : '#e0e0e0')};
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 5px 8px;
  }
`;

const CompanyLogoFilter = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  background: #f5f5f5;
  border: 1px solid #e8ecef;
`;

const CategoryTagWrapper = styled.div`
  margin: 8px 0;
`;

const CategoryTitle = styled.strong`
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
`;

const JobSearch: React.FC<JobSearchProps> = ({ jobs, onFilter, activeFilters }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: activeFilters.search || '',
    tags: activeFilters.tags || new Set(),
    company: activeFilters.company || null,
    portal: activeFilters.portal || null,
  });
  const [companyLogos, setCompanyLogos] = useState<{ [key: string]: string | undefined }>({});

  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  useEffect(() => {
    const fetchLogos = async () => {
      const uniqueCompanies = Array.from(new Set(jobs.map((job) => job.company)));
      const logos = { ...companyLogos };
      for (const company of uniqueCompanies) {
        if (!logos[company]) {
          const logo = await JobsService.getCompanyLogo(company);
          logos[company] = logo || undefined;
        }
      }
      setCompanyLogos(logos);
    };
    if (jobs.length > 0) fetchLogos();
  }, [jobs]);

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
    const companyData: { [key: string]: { count: number; logo?: string } } = {};
    jobs.forEach((job) => {
      if (!companyData[job.company]) {
        companyData[job.company] = { count: 0, logo: companyLogos[job.company] || job.companyLogo };
      }
      companyData[job.company].count += 1;
    });
    return Object.entries(companyData)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([company, { logo }]) => ({
        company,
        logo: logo || undefined,
        hasLogo: !!logo && logo !== '/unkownbusiness.png',
      }));
  };

  const getTopCategoriesWithTags = () => {
    const categoryCount: { [key: string]: number } = {};
    const tagByCategory: { [key: string]: Set<string> } = {};

    jobs.forEach((job) => {
      job.tags.forEach((tag) => {
        TAG_CATEGORIES.forEach(({ categoría, subcategorías }) => {
          for (const [, tags] of Object.entries(subcategorías)) {
            if ((tags as string[]).includes(tag)) {
              categoryCount[categoría] = (categoryCount[categoría] || 0) + 1;
              if (!tagByCategory[categoría]) tagByCategory[categoría] = new Set();
              tagByCategory[categoría].add(tag);
              break;
            }
          }
        });
      });
    });

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => ({
        category,
        tags: Array.from(tagByCategory[category] || new Set())
          .sort((a, b) => {
            const countA = jobs.filter((j) => j.tags.includes(a)).length;
            const countB = jobs.filter((j) => j.tags.includes(b)).length;
            return countB - countA;
          })
          .slice(0, 5),
      }));

    return topCategories;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value, portal: null };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSearchSubmit = (
    e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e.type === 'click' || (e as React.KeyboardEvent<HTMLInputElement>).key === 'Enter') {
      const newFilters = { ...filters, portal: null };
      setFilters(newFilters);
      onFilter(newFilters);
    }
  };

  const toggleTagFilter = (tag: string) => {
    const newTags = new Set(filters.tags);
    if (newTags.has(tag)) newTags.delete(tag);
    else newTags.add(tag);
    const newFilters = { ...filters, tags: newTags, company: null, portal: null };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const toggleCompanyFilter = (company: string) => {
    const newCompany = filters.company === company ? null : company;
    const newFilters = { ...filters, company: newCompany, tags: new Set<string>(), portal: null };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const togglePortalFilter = (portal: string) => {
    const newPortal = filters.portal === portal ? null : portal;
    const newFilters = { ...filters, portal: newPortal, tags: new Set<string>(), company: null };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const topTags = getTopTags();
  const topCompanies = getTopCompanies();
  const topCategoriesWithTags = getTopCategoriesWithTags();

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
            onKeyPress={handleSearchSubmit}
            placeholder="Search jobs or companies..."
            whileFocus={{ scale: 1.02 }}
          />
          <SearchButton
            onClick={handleSearchSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            🔍
          </SearchButton>
        </SearchBar>
      </TopRow>
      <SectionTitle>Portales</SectionTitle>
      <PortalFilterContainer
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PortalButton
          className="bne"
          active={filters.portal === 'BNE.cl'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => togglePortalFilter('BNE.cl')}
        />
        <PortalButton
          className="getonboard"
          active={filters.portal === 'Get On Board'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => togglePortalFilter('Get On Board')}
        />
      </PortalFilterContainer>
      <FilterRow
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <FilterCategory>
          <FilterLabel>Tags más repetidos:</FilterLabel>
          <FilterOptions>
            {topTags.map((tag) => (
              <FilterOption
                key={tag}
                active={filters.tags.has(tag)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleTagFilter(tag)}
              >
                #{tag}
              </FilterOption>
            ))}
          </FilterOptions>
        </FilterCategory>
        <FilterCategory>
          <FilterLabel>Top Categories</FilterLabel>
          <FilterOptions>
            {topCategoriesWithTags.map(({ category, tags }) => (
              <CategoryTagWrapper key={category}>
                <CategoryTitle>{category}</CategoryTitle>
                {tags.map((tag) => (
                  <FilterOption
                    key={tag}
                    active={filters.tags.has(tag)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleTagFilter(tag)}
                  >
                    #{tag}
                  </FilterOption>
                ))}
              </CategoryTagWrapper>
            ))}
          </FilterOptions>
        </FilterCategory>
        <FilterCategory>
          <FilterLabel>Popular Companies</FilterLabel>
          <FilterOptions>
            {topCompanies.map(({ company, logo, hasLogo }) => (
              <FilterOption
                key={company}
                active={filters.company === company}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCompanyFilter(company)}
              >
                {hasLogo && logo && <CompanyLogoFilter src={logo} alt={`${company} logo`} />}
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