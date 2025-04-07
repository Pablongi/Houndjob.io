import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import SearchBar from './components/SearchBar';
import FilterTabs, { Filters } from './components/FilterTabs';
import JobCard from './components/JobCard';
import JobsService from './service/JobsService';
import { FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Job } from './types/Job';

const h = 15;

const Header = styled.header`
  background: #FFF;
  color: #333;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  height: ${h}px;
  overflow: hidden;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
  filter: none;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavLink = styled.a`
  color: #333;
  text-decoration: none;
  font-size: 16px;
  &:hover {
    color: #1E90FF;
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.1);
  }
`;

const AppContainer = styled.div`
  margin: 0 auto;
  padding: 20px 40px;
  padding-top: ${h + 50}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1800px;
  background: #F5F5F5;
  overflow-x: hidden;
`;

const MainContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchBarWrapper = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const FilterTabsWrapper = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const JobsList = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(315px, 1fr)); /* Ajustado de 320px a 315px */
  gap: 20px;
  justify-items: center;
  overflow-x: hidden;
  background: #F5F5F5;
  padding: 16px;
  border-radius: 8px;
  box-sizing: border-box;
  max-width: 100%;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 40px 0;
  width: 100%;
`;

const PageButton = styled.button<{ active?: boolean }>`
  background: ${(props) => (props.active ? '#1E90FF' : '#FFF')};
  color: ${(props) => (props.active ? '#FFF' : '#333')};
  border: 1px solid #E6E6E6;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.3s, transform 0.2s;
  &:hover {
    background: #1E90FF;
    color: #FFF;
    transform: scale(1.05);
  }
  &:disabled {
    background: #EEE;
    color: #999;
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.span`
  font-size: 16px;
  color: #333;
`;

const Footer = styled.footer`
  background: #FFF;
  padding: 30px;
  text-align: center;
  color: #333;
  font-size: 16px;
  border-top: 1px solid #E6E6E6;
  width: 100%;
  margin-top: 50px;
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  color: #1E90FF;
  font-size: 16px;
  cursor: pointer;
  padding: 0 8px;
  &:hover {
    color: #63B3ED;
    text-decoration: underline;
  }
`;

const inferExperienceLevel = (title: string, seniorityId?: number, seniorityData?: any): string => {
  const seniorityMap: { [key: number]: string } = {
    1: 'Junior',
    2: 'Mid-level',
    3: 'Semi Senior',
    4: 'Senior',
    5: 'Expert',
  };
  if (seniorityId && seniorityMap[seniorityId]) return seniorityMap[seniorityId];
  if (seniorityData?.attributes?.name) return seniorityData.attributes.name;
  if (title.toLowerCase().includes('senior')) return 'Senior';
  if (title.toLowerCase().includes('junior')) return 'Junior';
  return 'No especificado';
};

const calculateMinutesSincePublished = (published: number | null): string => {
  if (!published) return 'N/A';
  const diff = Math.floor((Date.now() - published * 1000) / (1000 * 60));
  if (diff < 60) return `${diff} min`;
  if (diff < 1440) return `${Math.floor(diff / 60)} h`;
  return `${Math.floor(diff / 1440)} d`;
};

const extractBenefits = (benefits?: string): string[] => {
  if (!benefits) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(benefits, 'text/html');
  return Array.from(doc.querySelectorAll('li'))
    .slice(0, 3)
    .map((li) => li.textContent || '');
};

const mapJobs = (jobsData: any[]): Job[] => {
  return jobsData.map((job) => {
    const attributes = job.attributes || {};
    const title = attributes.title || 'N/A';
    const companyName =
      typeof attributes.company === 'string'
        ? attributes.company
        : attributes.company?.name || 'Empresa Desconocida';
    const companyLogo = attributes.company_logo || null;

    let category = attributes.category_name || 'Sin categoría';
    if (!category && title.toLowerCase().includes('developer')) category = 'Developer';
    else if (!category && title.toLowerCase().includes('engineer')) category = 'Engineer';
    else if (!category && title.toLowerCase().includes('senior')) category = 'Senior';
    else if (!category && title.toLowerCase().includes('lead')) category = 'Lead';
    else if (!category && title.toLowerCase().includes('analyst')) category = 'Analyst';
    else if (!category && title.toLowerCase().includes('manager')) category = 'Manager';

    const modality = attributes.remote_modality || 'No especificado';
    const remoteStatus = attributes.remote ? 'Remoto' : 'Presencial';

    return {
      id: job.id || '',
      title,
      company: companyName,
      companyId: attributes.company_id || '',
      companyLogo,
      modality,
      remoteStatus,
      location: attributes.countries?.[0] || attributes.location || 'N/A',
      published: attributes.published_at || null,
      portal: 'GetOnBoard',
      publicUrl: job.links?.public_url || attributes.public_url || '',
      category,
      tags: attributes.tags?.data?.map((tag: any) => tag.id) || [],
      perks: attributes.perks || [],
      benefits: attributes.benefits ? extractBenefits(attributes.benefits) : [],
      experienceLevel: inferExperienceLevel(title, undefined, attributes.seniority?.data),
      interestedCount: attributes.applications_count || 0,
      salary:
        attributes.min_salary && attributes.max_salary
          ? `${attributes.min_salary} - ${attributes.max_salary}`
          : attributes.salary || 'No especificado',
      description: attributes.description || '',
      functions: attributes.functions || '',
    };
  }).sort((a, b) => (b.published || 0) - (a.published || 0));
};

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [visibleJobs, setVisibleJobs] = useState<string[]>([]);
  const jobsPerPage = 40;

  const observer = useRef<IntersectionObserver | null>(null);

  const currentJobs = useMemo(() => {
    const start = (currentPage - 1) * jobsPerPage;
    return jobs.slice(start, start + jobsPerPage);
  }, [jobs, currentPage]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await JobsService.getJobs({}, currentPage, jobsPerPage);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mappedJobs = mapJobs(response.data);
        setJobs(mappedJobs);
      } else {
        setError('No se encontraron trabajos en la API.');
      }
    } catch (err: any) {
      console.error('Error al cargar trabajos:', err.message);
      setError('Error al cargar los trabajos. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (!currentJobs.length) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const jobId = entry.target.getAttribute('data-job-id');
            if (jobId && !visibleJobs.includes(jobId)) {
              setVisibleJobs((prev) => [...prev, jobId]);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const jobElements = document.querySelectorAll('.job-card');
    jobElements.forEach((el) => observer.current?.observe(el));

    return () => observer.current?.disconnect();
  }, [currentJobs, visibleJobs]);

  const handleSearch = useCallback(
    (query: string) => {
      setLoading(true);
      setError(null);
      const filteredJobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query.toLowerCase()) ||
          job.company.toLowerCase().includes(query.toLowerCase()) ||
          job.description.toLowerCase().includes(query.toLowerCase()) ||
          job.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setJobs(filteredJobs);
      setCurrentPage(1);
      setVisibleJobs([]);
      setLoading(false);
      if (!filteredJobs.length)
        setError('No se encontraron trabajos que coincidan con la búsqueda.');
    },
    [jobs]
  );

  const handleFilter = useCallback(
    (newFilters: Filters) => {
      setLoading(true);
      setError(null);
      const filteredJobs = jobs.filter((job) => {
        const matchesCompany =
          !newFilters.company.length ||
          newFilters.company.some((c) => job.company.toLowerCase() === c.toLowerCase());
        const matchesCategory =
          !newFilters.category.length ||
          newFilters.category.some((c) => job.category.toLowerCase() === c.toLowerCase());
        const matchesModality =
          !newFilters.modality.length ||
          newFilters.modality.some((m) => job.modality.toLowerCase() === m.toLowerCase());
        const matchesExperience =
          !newFilters.experience.length ||
          newFilters.experience.some(
            (e) => job.experienceLevel.toLowerCase() === e.toLowerCase()
          );
        const matchesLocation =
          !newFilters.location.length ||
          newFilters.location.some((l) => job.location.toLowerCase() === l.toLowerCase());
        const matchesSalary =
          !newFilters.salary.length ||
          newFilters.salary.some((s) => {
            if (
              s === 'Menos de 2000' &&
              job.salary &&
              parseInt(job.salary.split('-')[0]) < 2000
            )
              return true;
            if (
              s === '2000-4000' &&
              job.salary &&
              parseInt(job.salary.split('-')[0]) >= 2000 &&
              parseInt(job.salary.split('-')[1]) <= 4000
            )
              return true;
            if (
              s === 'Más de 4000' &&
              job.salary &&
              parseInt(job.salary.split('-')[1]) > 4000
            )
              return true;
            return false;
          });
        const matchesTimePosted =
          !newFilters.timePosted.length ||
          newFilters.timePosted.some((t) => {
            const time = calculateMinutesSincePublished(job.published);
            if (t === 'Hoy' && time.includes('min')) return true;
            if (t === 'Última semana' && time.includes('h')) return true;
            if (t === 'Último mes' && time.includes('d')) return true;
            if (t === 'Cualquiera') return true;
            return false;
          });
        const matchesRemote =
          !newFilters.remote.length ||
          newFilters.remote.some((r) => job.remoteStatus.toLowerCase() === r.toLowerCase());
        const matchesTags =
          !newFilters.tags.length ||
          newFilters.tags.some((t) =>
            job.tags.some((tag) => tag.toLowerCase() === t.toLowerCase())
          );

        return (
          matchesCompany &&
          matchesCategory &&
          matchesModality &&
          matchesExperience &&
          matchesLocation &&
          matchesSalary &&
          matchesTimePosted &&
          matchesRemote &&
          matchesTags
        );
      });
      setJobs(filteredJobs);
      setCurrentPage(1);
      setVisibleJobs([]);
      setLoading(false);
      if (!filteredJobs.length)
        setError('No se encontraron trabajos que coincidan con los filtros.');
    },
    [jobs]
  );

  const handleSave = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    const newBackground = darkMode ? '#F5F5F5' : '#1A2A44';
    const newTextColor = darkMode ? '#333' : '#FFF';
    document.body.style.backgroundColor = newBackground;
    document.body.style.color = newTextColor;
    document.documentElement.style.setProperty('--background', newBackground);
    document.documentElement.style.setProperty('--text-primary', newTextColor);
    document.documentElement.style.setProperty(
      '--text-secondary',
      darkMode ? '#666' : '#B0B0B0'
    );
  };

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div className="App">
      <Header>
        <LogoContainer>
          <LogoImage src="/houndjob-logo.png" alt="HoundJob Logo" />
          <Logo>HoundJob</Logo>
        </LogoContainer>
        <Nav>
          <NavLink href="#">Home</NavLink>
          <ThemeToggle onClick={toggleDarkMode} aria-label="Cambiar tema">
            {darkMode ? <FaSun /> : <FaMoon />}
          </ThemeToggle>
        </Nav>
      </Header>
      <AppContainer>
        <MainContent>
          <SearchBarWrapper>
            <SearchBar onSearch={handleSearch} jobs={jobs} />
          </SearchBarWrapper>
          {error && (
            <p style={{ color: '#666', textAlign: 'center', fontSize: '16px' }}>
              {error}
            </p>
          )}
          {!error && (
            <>
              <FilterTabsWrapper>
                <FilterTabs onFilter={handleFilter} jobs={jobs} />
              </FilterTabsWrapper>
              <JobsList>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px' }}>
                    Cargando...
                  </div>
                ) : currentJobs.length ? (
                  currentJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      className="job-card"
                      data-job-id={job.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: visibleJobs.includes(job.id) ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {visibleJobs.includes(job.id) ? (
                        <JobCard
                          {...job}
                          onApply={() => window.open(job.publicUrl, '_blank')}
                          onSave={() => handleSave(job.id)}
                          isSaved={savedJobs.has(job.id)}
                        />
                      ) : (
                        <div
                          style={{
                            width: '300px',
                            height: '180px',
                            background: '#EEE',
                            borderRadius: '10px',
                          }}
                        />
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p style={{ color: '#666', textAlign: 'center', fontSize: '16px' }}>
                    No hay empleos disponibles.
                  </p>
                )}
              </JobsList>
              {jobs.length > 0 && (
                <Pagination>
                  <PageButton
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    Anterior
                  </PageButton>
                  <PaginationInfo>
                    Página {currentPage} de {totalPages}
                  </PaginationInfo>
                  <PageButton
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, Math.ceil(jobs.length / jobsPerPage)))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                  >
                    Siguiente
                  </PageButton>
                </Pagination>
              )}
            </>
          )}
        </MainContent>
      </AppContainer>
      <Footer>
        © 2025 HoundJob | <FooterLink>Términos</FooterLink> |{' '}
        <FooterLink>Privacidad</FooterLink> | <FooterLink>Contáctanos</FooterLink>
      </Footer>
      <style>{`
  :root {
    --glacier: #79b2c6;
    --elephant: #0c263b;
    --blue-bayoux: #4c6877;
    --raven: #717d89;
    --river-bed: #404e59;
    --slate-gray: #7b8c94;
    --horizon: #55849c;
    --rhino: #294656;
    --san-juan: #30546c;
    --text-primary: #1a2b49;
    --text-secondary: #6b7280;
    --background: #f5f7fa;
    --white: #ffffff;
    --border: #d1d5db;
    --hover: #00A693;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
  }
`}</style>
    </div>
  );
};

export default App;