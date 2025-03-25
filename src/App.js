import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import SearchBar from './components/SearchBar';
import FilterTabs from './components/FilterTabs';
import JobCard from './components/JobCard';
import JobsService from './service/JobsService';
import { FaHome } from 'react-icons/fa';

// Estilos
const Header = styled.header`
  background: var(--elephant);
  color: #fff;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: var(--glacier);
`;

const Nav = styled.nav`
  display: flex;
  gap: 15px;
`;

const NavLink = styled.a`
  color: var(--horizon);
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.3s;
  &:hover {
    background: var(--rhino);
  }
`;

const NavIcon = styled.span`
  margin-right: 5px;
`;

const LoginButton = styled.button`
  background: var(--glacier);
  color: var(--elephant);
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
  &:hover {
    background: var(--horizon);
  }
`;

const Footer = styled.footer`
  background-color: var(--blue-bayoux);
  padding: 20px;
  text-align: center;
  color: var(--slate-gray);
  font-size: 12px;
  border-top: 1px solid var(--river-bed);
  margin-top: auto;
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  color: var(--glacier);
  font-size: 12px;
  cursor: pointer;
  padding: 0 5px;
  transition: color 0.3s;
  &:hover {
    color: var(--horizon);
    text-decoration: underline;
  }
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  flex: 1;
  display: flex;
  gap: 20px;
`;

const MainContent = styled.div`
  flex: 1;
`;

const JobsList = styled.div`
  margin: 30px 0;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px var(--raven);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const PageButton = styled.button`
  background: ${(props) => (props.active ? 'var(--glacier)' : '#fff')};
  color: ${(props) => (props.active ? 'var(--elephant)' : 'var(--san-juan)')};
  border: 1px solid var(--slate-gray);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  &:hover {
    background: var(--horizon);
    color: #fff;
  }
  &:disabled {
    background: var(--river-bed);
    color: var(--raven);
    cursor: not-allowed;
  }
`;

// Función para inferir categorías a partir del título
const inferCategoryFromTitle = (title) => {
  if (!title || title === 'N/A') return 'Sin categoría';
  if (title.includes('Java')) return 'Java';
  if (title.includes('Python')) return 'Python';
  if (title.includes('React')) return 'React';
  if (title.includes('Angular')) return 'Angular';
  if (title.includes('Node')) return 'Node.js';
  if (title.includes('Full-Stack')) return 'Full-Stack';
  if (title.includes('Backend')) return 'Backend';
  if (title.includes('Frontend')) return 'Frontend';
  if (title.includes('C++')) return 'C++';
  if (title.includes('PHP')) return 'PHP';
  if (title.includes('Ruby')) return 'Ruby';
  if (title.includes('SQL')) return 'SQL';
  if (title.includes('AWS')) return 'AWS';
  if (title.includes('Azure')) return 'Azure';
  if (title.includes('Golang')) return 'Golang';
  if (title.includes('Flutter')) return 'Flutter';
  if (title.includes('DevOps')) return 'DevOps';
  if (title.includes('AI')) return 'AI';
  if (title.includes('Machine Learning')) return 'Machine Learning';
  if (title.includes('Data')) return 'Data';
  if (title.includes('Web')) return 'Web';
  if (title.includes('Mobile')) return 'Mobile';
  if (title.includes('Desarrollador')) return 'Developer';
  if (title.includes('Senior')) return 'Senior';
  if (title.includes('Junior')) return 'Junior';
  if (title.includes('Lead')) return 'Lead';
  if (title.includes('Manager')) return 'Manager';
  if (title.includes('Analyst')) return 'Analyst';
  if (title.includes('Engineer')) return 'Engineer';
  if (title.includes('Architect')) return 'Architect';
  if (title.includes('Consultant')) return 'Consultant';
  if (title.includes('Product')) return 'Product';
  if (title.includes('Designer')) return 'Designer';
  if (title.includes('HR')) return 'HR';
  if (title.includes('Recruit')) return 'Recruitment';
  if (title.includes('Marketing')) return 'Marketing';
  if (title.includes('Sales')) return 'Sales';
  if (title.includes('Advertising')) return 'Advertising';
  return 'Sin categoría';
};

// Función para inferir modalidad si no está disponible
const inferModality = (title, remote) => {
  if (remote === true) return 'Remote';
  if (title.includes('Remote')) return 'Remote';
  if (title.includes('Hybrid')) return 'Hybrid';
  return 'On-site';
};

// Función para inferir nivel de experiencia si no está disponible
const inferExperienceLevel = (title) => {
  if (title.includes('Senior')) return 'Senior';
  if (title.includes('Junior')) return 'Junior';
  if (title.includes('Lead')) return 'Lead';
  if (title.includes('Manager')) return 'Manager';
  return 'No especificado';
};

// Función para inferir ubicación si no está disponible
const inferLocation = (title) => {
  if (title.includes('Chile')) return 'Chile';
  if (title.includes('Santiago')) return 'Santiago';
  if (title.includes('Valparaíso')) return 'Valparaíso';
  if (title.includes('Concepción')) return 'Concepción';
  if (title.includes('Antofagasta')) return 'Antofagasta';
  if (title.includes('Viña del Mar')) return 'Viña del Mar';
  return 'No especificado';
};

const App = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 30;

  const fetchJobs = useCallback(() => {
    setLoading(true);
    setError(null);
    JobsService.getJobs()
      .then((response) => {
        console.log('Respuesta de la API:', response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          const formattedJobs = response.data.map((job) => {
            const title = job.attributes?.title || 'N/A';
            const seniorityName = job.attributes?.seniority?.data?.attributes?.name || inferExperienceLevel(title);
            const companyName = job.attributes?.company?.data?.attributes?.name || 'N/A';
            const location = job.attributes?.countries?.[0] || inferLocation(title);
            const modality = job.attributes?.remote_modality || inferModality(title, job.attributes?.remote);
            
            // Log the raw published_at value for debugging
            console.log(`Job ID: ${job.id}, raw published_at: ${job.attributes?.published_at}`);

            // Parse published_at
            let published = null;
            const publishedAt = job.attributes?.published_at;
            if (publishedAt) {
              if (typeof publishedAt === 'number') {
                // If it's a timestamp in milliseconds (e.g., 1640995200000), convert to seconds
                if (publishedAt > 1e12) {
                  published = Math.floor(publishedAt / 1000);
                } else {
                  published = publishedAt; // Already in seconds
                }
              } else if (typeof publishedAt === 'string') {
                // Handle ISO format or other string formats
                const date = new Date(publishedAt);
                if (!isNaN(date.getTime())) {
                  published = Math.floor(date.getTime() / 1000); // Convert to Unix timestamp in seconds
                }
              }
            }
            // Log the parsed published value
            console.log(`Job ID: ${job.id}, parsed published: ${published}`);

            const publicUrl = job.links?.public_url
              ? (job.links.public_url.startsWith('http') ? job.links.public_url : `https://www.getonbrd.com${job.links.public_url}`)
              : `https://www.getonbrd.com/jobs/${job.id || ''}`;
            const category = job.attributes?.category_name || inferCategoryFromTitle(title);

            return {
              id: job.id || '',
              title: title,
              company: companyName,
              modality: modality,
              location: location,
              published: published,
              portal: 'GetOnBoard',
              publicUrl: publicUrl,
              category: category,
              descriptionTags: job.attributes?.perks || [],
              experienceLevel: seniorityName,
              interestedCount: job.attributes?.applications_count || 0,
            };
          }).sort((a, b) => {
            const aPublished = a.published || 0;
            const bPublished = b.published || 0;
            return bPublished - aPublished;
          });
          setJobs(formattedJobs);
        } else {
          console.log('No jobs found in API response');
          setError('No se encontraron trabajos en la respuesta de la API.');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar los empleos:', error.message);
        setError(`Error al cargar los empleos: ${error.message}`);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = ({ query }) => {
    setLoading(true);
    setError(null);
    JobsService.getJobs()
      .then((response) => {
        console.log('Respuesta de la API (búsqueda):', response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          const formattedJobs = response.data
            .map((job) => {
              const title = job.attributes?.title || 'N/A';
              const seniorityName = job.attributes?.seniority?.data?.attributes?.name || inferExperienceLevel(title);
              const companyName = job.attributes?.company?.data?.attributes?.name || 'N/A';
              const location = job.attributes?.countries?.[0] || inferLocation(title);
              const modality = job.attributes?.remote_modality || inferModality(title, job.attributes?.remote);
              
              // Log the raw published_at value for debugging
              console.log(`Job ID: ${job.id}, raw published_at: ${job.attributes?.published_at}`);

              // Parse published_at
              let published = null;
              const publishedAt = job.attributes?.published_at;
              if (publishedAt) {
                if (typeof publishedAt === 'number') {
                  if (publishedAt > 1e12) {
                    published = Math.floor(publishedAt / 1000);
                  } else {
                    published = publishedAt;
                  }
                } else if (typeof publishedAt === 'string') {
                  const date = new Date(publishedAt);
                  if (!isNaN(date.getTime())) {
                    published = Math.floor(date.getTime() / 1000);
                  }
                }
              }
              console.log(`Job ID: ${job.id}, parsed published: ${published}`);

              const publicUrl = job.links?.public_url
                ? (job.links.public_url.startsWith('http') ? job.links.public_url : `https://www.getonbrd.com${job.links.public_url}`)
                : `https://www.getonbrd.com/jobs/${job.id || ''}`;
              const category = job.attributes?.category_name || inferCategoryFromTitle(title);

              return {
                id: job.id || '',
                title: title,
                company: companyName,
                modality: modality,
                location: location,
                published: published,
                portal: 'GetOnBoard',
                publicUrl: publicUrl,
                category: category,
                descriptionTags: job.attributes?.perks || [],
                experienceLevel: seniorityName,
                interestedCount: job.attributes?.applications_count || 0,
              };
            })
            .filter((job) => {
              const matchesQuery = query
                ? job.title.toLowerCase().includes(query.toLowerCase()) ||
                  job.company.toLowerCase().includes(query.toLowerCase())
                : true;
              return matchesQuery;
            })
            .sort((a, b) => {
              const aPublished = a.published || 0;
              const bPublished = b.published || 0;
              return bPublished - aPublished;
            });
          console.log('Trabajos después de búsqueda:', formattedJobs);
          if (formattedJobs.length > 0) {
            setJobs(formattedJobs);
            setCurrentPage(1);
          } else {
            setError('No se encontraron trabajos que coincidan con la búsqueda.');
          }
        } else {
          console.log('No jobs found in API response (search)');
          setError('No se encontraron trabajos en la búsqueda.');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error searching jobs:', error.message);
        setError(`Error al buscar trabajos: ${error.message}`);
        setLoading(false);
      });
  };

  const handleFilter = (filters) => {
    setLoading(true);
    setError(null);
    console.log('Filtros aplicados:', filters);
    JobsService.getJobs()
      .then((response) => {
        console.log('Respuesta de la API (filtro):', response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          const formattedJobs = response.data
            .map((job) => {
              const title = job.attributes?.title || 'N/A';
              const seniorityName = job.attributes?.seniority?.data?.attributes?.name || inferExperienceLevel(title);
              const companyName = job.attributes?.company?.data?.attributes?.name || 'N/A';
              const location = job.attributes?.countries?.[0] || inferLocation(title);
              const modality = job.attributes?.remote_modality || inferModality(title, job.attributes?.remote);
              
              // Log the raw published_at value for debugging
              console.log(`Job ID: ${job.id}, raw published_at: ${job.attributes?.published_at}`);

              // Parse published_at
              let published = null;
              const publishedAt = job.attributes?.published_at;
              if (publishedAt) {
                if (typeof publishedAt === 'number') {
                  if (publishedAt > 1e12) {
                    published = Math.floor(publishedAt / 1000);
                  } else {
                    published = publishedAt;
                  }
                } else if (typeof publishedAt === 'string') {
                  const date = new Date(publishedAt);
                  if (!isNaN(date.getTime())) {
                    published = Math.floor(date.getTime() / 1000);
                  }
                }
              }
              console.log(`Job ID: ${job.id}, parsed published: ${published}`);

              const publicUrl = job.links?.public_url
                ? (job.links.public_url.startsWith('http') ? job.links.public_url : `https://www.getonbrd.com${job.links.public_url}`)
                : `https://www.getonbrd.com/jobs/${job.id || ''}`;
              const category = job.attributes?.category_name || inferCategoryFromTitle(title);

              return {
                id: job.id || '',
                title: title,
                company: companyName,
                modality: modality,
                location: location,
                published: published,
                portal: 'GetOnBoard',
                publicUrl: publicUrl,
                category: category,
                descriptionTags: job.attributes?.perks || [],
                experienceLevel: seniorityName,
                interestedCount: job.attributes?.applications_count || 0,
              };
            })
            .filter((job) => {
              const matchesModality = filters.modality ? job.modality.toLowerCase() === filters.modality.toLowerCase() : true;
              const matchesSeniority = filters.seniority ? job.experienceLevel.toLowerCase() === filters.seniority.toLowerCase() : true;
              const matchesTag = filters.tag ? job.title.toLowerCase().includes(filters.tag.toLowerCase()) : true;
              const matchesCompany = filters.company ? job.company.toLowerCase() === filters.company.toLowerCase() : true;
              const matchesCategory = filters.category ? job.category.toLowerCase() === filters.category.toLowerCase() : true;
              const matchesLocation = filters.location ? job.location.toLowerCase() === filters.location.toLowerCase() : true;
              let matchesAge = true;
              if (filters.age) {
                const jobDate = parseInt(job.published || 0) * 1000;
                const now = Date.now();
                if (filters.age === 'last_week') {
                  matchesAge = now - jobDate <= 7 * 24 * 60 * 60 * 1000;
                } else if (filters.age === 'last_month') {
                  matchesAge = now - jobDate <= 30 * 24 * 60 * 60 * 1000;
                } else if (filters.age === 'last_3_months') {
                  matchesAge = now - jobDate <= 90 * 24 * 60 * 60 * 1000;
                }
              }
              return matchesModality && matchesSeniority && matchesTag && matchesCompany && matchesCategory && matchesLocation && matchesAge;
            })
            .sort((a, b) => {
              const aPublished = a.published || 0;
              const bPublished = b.published || 0;
              return bPublished - aPublished;
            });
          console.log('Trabajos después de filtrar:', formattedJobs);
          if (formattedJobs.length > 0) {
            setJobs(formattedJobs);
            setCurrentPage(1);
          } else {
            setError('No se encontraron trabajos al aplicar los filtros.');
          }
        } else {
          console.log('No jobs found in API response (filter)');
          setError('No se encontraron trabajos al aplicar los filtros.');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error filtering jobs:', error.message);
        setError(`Error al filtrar trabajos: ${error.message}`);
        setLoading(false);
      });
  };  

  const handleApply = (jobTitle) => {
    console.log(`Applying for ${jobTitle}...`);
  };

  const handleShare = (jobId) => {
    setShowShareMenu(showShareMenu === jobId ? null : jobId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest('.share-menu')) {
        setShowShareMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showShareMenu]);

  // Lógica de paginación
  const totalJobs = jobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <Header>
        <LogoContainer>
          <LogoImage src="/HoundJob LOGO.png" alt="HoundJob Logo" />
          <Logo>HoundJob</Logo>
        </LogoContainer>
        <Nav>
          <NavLink href="#">
            <NavIcon>
              <FaHome />
            </NavIcon>
            Home
          </NavLink>
        </Nav>
        <LoginButton>Iniciar Sesión</LoginButton>
      </Header>
      <AppContainer>
        <MainContent>
          <SearchBar onSearch={handleSearch} jobs={jobs} />
          {error ? (
            <p style={{ color: 'var(--san-juan)', textAlign: 'center' }}>{error}</p>
          ) : (
            <>
              <FilterTabs onFilter={handleFilter} jobs={jobs} />
              <JobsList>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ border: '4px solid var(--slate-gray)', borderTop: '4px solid var(--glacier)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ color: 'var(--raven)' }}>Cargando...</p>
                  </div>
                ) : currentJobs.length > 0 ? (
                  currentJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      {...job}
                      onApply={() => handleApply(job.title)}
                      onShare={() => handleShare(job.id)}
                    />
                  ))
                ) : (
                  <p style={{ color: 'var(--san-juan)', textAlign: 'center' }}>
                    No se encontraron empleos. Intenta ajustar los filtros o verifica tu conexión a internet. Si el problema persiste, puede que la carga haya tomado demasiado tiempo.
                  </p>
                )}
              </JobsList>
              {totalJobs > 0 && (
                <Pagination>
                  <PageButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </PageButton>
                  {[...Array(totalPages).keys()].map((page) => (
                    <PageButton
                      key={page + 1}
                      onClick={() => handlePageChange(page + 1)}
                      active={currentPage === page + 1}
                    >
                      {page + 1}
                    </PageButton>
                  ))}
                  <PageButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
        © 2025 HoundJob |{' '}
        <FooterLink>Términos</FooterLink> |{' '}
        <FooterLink>Privacidad</FooterLink> |{' '}
        <FooterLink>Contáctanos</FooterLink>
        <p style={{ marginTop: '10px' }}>
          HoundJob Network Technology Co., Ltd. Dirección: Santiago, Chile
          <br />Línea de servicio empresarial y canales de reporte: 400 065 5799
          <br />Días hábiles: 8:00 - 22:00 | Cerrado los fines de semana
          <br />Reporta información ilegal o dañina a soporte@houndjob.com
          <br />Ofertas de trabajo proporcionadas por{' '}
          <a href="https://www.getonbrd.com" style={{ color: 'var(--glacier)' }}>
            GetOnBoard
          </a>
        </p>
      </Footer>
      <style>{`
        :root {
          --glacier: #79b2c6;
          --elephant: #133b54;
          --blue-bayoux: #4c6877;
          --raven: #717d89;
          --river-bed: #404e59;
          --slate-gray: #7b8c94;
          --horizon: #55849c;
          --rhino: #294656;
          --san-juan: #30546c;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .AppContainer { flex-direction: column; padding: 10px; }
          .MainContent { flex: none; width: 100%; }
          .JobsList { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default App;