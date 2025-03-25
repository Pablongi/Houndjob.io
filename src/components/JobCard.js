import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaShareAlt, FaClock, FaGlobe, FaHeart, FaBookmark, FaBuilding } from 'react-icons/fa';

// Contenedor de la tarjeta
const Card = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  background-color: #fff;
  border: 1px solid var(--slate-gray);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  min-height: 180px;
  height: auto;
  position: relative;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

// Distintivo "NEW!" estilo cómic
const NewBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--glacier);
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  transform: rotate(15deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid #fff;
  text-transform: uppercase;
  z-index: 1;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% {
      transform: scale(1) rotate(15deg);
    }
    50% {
      transform: scale(1.1) rotate(15deg);
    }
    100% {
      transform: scale(1) rotate(15deg);
    }
  }
`;

// Contenedor superior (para título y compañía)
const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: 6px;
  border-radius: 6px 6px 0 0;
`;

// Título del trabajo (enlace)
const JobTitle = styled.a`
  color: var(--glacier);
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
  &:hover {
    color: var(--horizon);
  }
`;

// Salario
const Salary = styled.div`
  color: var(--san-juan);
  font-size: 12px;
  font-weight: 600;
  margin-top: 2px;
`;

// Contenedor de la compañía (con logo y nombre)
const CompanyContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

// Logo de la empresa
const CompanyLogo = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: contain;
  display: ${(props) => (props.isLoaded ? 'block' : 'none')};
`;

// Nombre de la compañía
const CompanyName = styled.p`
  color: var(--elephant);
  font-size: 10px;
  margin: 0;
  font-weight: 500;
`;

// Jornada y Modalidad
const WorkDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--san-juan);
  font-size: 9px;
  margin-top: 2px;
`;

// Ubicación
const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--san-juan);
  font-size: 9px;
  margin-top: 2px;
`;

// Seniority
const Seniority = styled.div`
  color: var(--san-juan);
  font-size: 9px;
  margin-top: 2px;
`;

// Contenedor inferior (para tags, publicado, etc.)
const BottomSection = styled.div`
  padding: 6px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

// Tags
const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
`;

const Tag = styled.span`
  background: var(--glacier);
  color: #fff;
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 8px;
`;

// Descripción adicional
const JobDescription = styled.div`
  margin-top: 4px;
  font-size: 8px;
  color: var(--raven);
`;

const DescriptionTag = styled.span`
  background: #e0e8f0;
  color: var(--raven);
  font-size: 7px;
  padding: 1px 4px;
  border-radius: 6px;
  margin-right: 4px;
  margin-bottom: 4px;
  display: inline-block;
`;

// Información del portal (con logo)
const PortalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--raven);
  font-size: 8px;
  margin-top: 2px;
`;

// Logo del portal GetOnBoard
const PortalLogo = styled.img`
  width: 14px;
  height: 14px;
  object-fit: contain;
  display: ${(props) => (props.isLoaded ? 'block' : 'none')};
`;

// Publicado (general)
const MetaInfo = styled.div`
  color: var(--raven);
  font-size: 8px;
  margin-top: 2px;
`;

// Publicado hoy (con cronómetro)
const PublishedToday = styled.div`
  color: var(--san-juan);
  font-size: 8px;
  font-weight: 500;
  margin-top: 2px;
`;

// Footer con enlace a la empresa
const FooterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--san-juan);
  font-size: 8px;
  margin-top: 4px;
  border-top: 1px solid var(--slate-gray);
  padding-top: 4px;
`;

const CompanyLink = styled.a`
  color: var(--glacier);
  text-decoration: none;
  transition: color 0.2s;
  &:hover {
    color: var(--horizon);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
`;

// Botón de enlace
const LinkButton = styled.a`
  background: var(--glacier);
  color: #fff;
  border: none;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
  &:hover {
    background: var(--horizon);
  }
`;

// Botón de interesado
const InterestedButton = styled.button`
  background: transparent;
  color: var(--san-juan);
  border: none;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

// Botón de guardar
const SaveButton = styled.button`
  background: transparent;
  color: var(--raven);
  border: none;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

// Botón de compartir
const ShareButton = styled.button`
  background: var(--elephant);
  color: #fff;
  border: none;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
  &:hover {
    background: var(--rhino);
  }
`;

const JobCard = ({
  id,
  title = 'N/A',
  company = 'N/A',
  modality = 'N/A',
  location = 'N/A',
  salary = '',
  published = null,
  portal = 'N/A',
  publicUrl = '#',
  category = 'N/A',
  descriptionTags = [],
  experienceLevel = 'N/A',
  interestedCount = 0,
  onInterested,
  onApply,
  onShare,
  onSave,
}) => {
  const [companyLogoLoaded, setCompanyLogoLoaded] = useState(false);
  const [portalLogoLoaded, setPortalLogoLoaded] = useState(false);
  const [minutesSincePublished, setMinutesSincePublished] = useState(0);
  const [randomClicks, setRandomClicks] = useState(0);

  // Generar un número random de clics para simular interacción
  useEffect(() => {
    setRandomClicks(Math.floor(Math.random() * 100)); // Número random entre 0 y 99
  }, []);

  // Depuración: Inspeccionar el valor de publicUrl
  console.log(`JobCard ID: ${id}, publicUrl: ${publicUrl}`);

  // Asegurarnos de que publicUrl sea una URL completa
  const formattedPublicUrl = publicUrl && publicUrl !== '#' && publicUrl !== ''
    ? (publicUrl.startsWith('http') ? publicUrl : `https://www.getonbrd.com${publicUrl}`)
    : '#';
  console.log(`JobCard ID: ${id}, formattedPublicUrl: ${formattedPublicUrl}`);

  const isLinkValid = formattedPublicUrl !== '#';
  console.log(`JobCard ID: ${id}, isLinkValid: ${isLinkValid}`);

  // Manejador para redirigir manualmente
  const handleLinkClick = (event) => {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
    console.log(`handleLinkClick called for JobCard ID: ${id}, formattedPublicUrl: ${formattedPublicUrl}`);
    if (isLinkValid) {
      console.log(`Opening URL: ${formattedPublicUrl}`);
      window.open(formattedPublicUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.log(`Link not valid for JobCard ID: ${id}`);
    }
  };

  // Formatear la fecha y hora de publicación
  const formatDateTime = (timestamp) => {
    if (!timestamp || isNaN(parseInt(timestamp))) {
      return 'Fecha no disponible';
    }
    const date = new Date(parseInt(timestamp) * 1000);
    if (isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Determinar si la oferta se publicó hoy
  const isPublishedToday = (timestamp) => {
    if (!timestamp || isNaN(parseInt(timestamp))) {
      return false;
    }
    const publishedDate = new Date(parseInt(timestamp) * 1000);
    if (isNaN(publishedDate.getTime())) {
      return false;
    }
    const today = new Date();
    return (
      publishedDate.getDate() === today.getDate() &&
      publishedDate.getMonth() === today.getMonth() &&
      publishedDate.getFullYear() === today.getFullYear()
    );
  };

  // Calcular minutos transcurridos desde la publicación
  const calculateMinutesSincePublished = (timestamp) => {
    if (!timestamp || isNaN(parseInt(timestamp))) {
      return 0;
    }
    const publishedTime = parseInt(timestamp) * 1000;
    const now = Date.now();
    const diffInMinutes = Math.floor((now - publishedTime) / (1000 * 60));
    return diffInMinutes;
  };

  // Formatear el tiempo transcurrido
  const formatTimeSincePublished = (minutes) => {
    if (minutes <= 0) {
      return 'Fecha no disponible';
    }
    if (minutes < 60) {
      return `Publicado hoy hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `Publicado hoy hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `Publicado hace ${days} día${days !== 1 ? 's' : ''}`;
    }
  };

  // Determinar si la oferta es "NEW" (publicada en las últimas 3 horas)
  const isNewOffer = (minutes) => {
    return minutes > 0 && minutes < 180; // 3 horas
  };

  // Actualizar el cronómetro cada minuto
  useEffect(() => {
    setMinutesSincePublished(calculateMinutesSincePublished(published));
    const interval = setInterval(() => {
      setMinutesSincePublished(calculateMinutesSincePublished(published));
    }, 60000);
    return () => clearInterval(interval);
  }, [published]);

  // Tags azules: Categorías y tecnologías
  const inferCategoryTags = (title) => {
    const tags = [];
    if (title.includes('Java')) tags.push('Java');
    if (title.includes('Python')) tags.push('Python');
    if (title.includes('React')) tags.push('React');
    if (title.includes('Angular')) tags.push('Angular');
    if (title.includes('Node')) tags.push('Node.js');
    if (title.includes('Full-Stack')) tags.push('Full-Stack');
    if (title.includes('Backend')) tags.push('Backend');
    if (title.includes('Frontend')) tags.push('Frontend');
    if (title.includes('C++')) tags.push('C++');
    if (title.includes('PHP')) tags.push('PHP');
    if (title.includes('Ruby')) tags.push('Ruby');
    if (title.includes('SQL')) tags.push('SQL');
    if (title.includes('AWS')) tags.push('AWS');
    if (title.includes('Azure')) tags.push('Azure');
    if (title.includes('Golang')) tags.push('Golang');
    if (title.includes('Flutter')) tags.push('Flutter');
    if (title.includes('DevOps')) tags.push('DevOps');
    if (title.includes('AI')) tags.push('AI');
    if (title.includes('Machine Learning')) tags.push('Machine Learning');
    if (title.includes('Data')) tags.push('Data');
    if (title.includes('Web')) tags.push('Web');
    if (title.includes('Mobile')) tags.push('Mobile');
    if (title.includes('Desarrollador')) tags.push('Developer');
    if (title.includes('Senior')) tags.push('Senior');
    if (title.includes('Junior')) tags.push('Junior');
    if (title.includes('Lead')) tags.push('Lead');
    if (title.includes('Manager')) tags.push('Manager');
    if (title.includes('Analyst')) tags.push('Analyst');
    if (title.includes('Engineer')) tags.push('Engineer');
    if (title.includes('Architect')) tags.push('Architect');
    if (title.includes('Consultant')) tags.push('Consultant');
    if (title.includes('Product')) tags.push('Product');
    if (title.includes('Designer')) tags.push('Designer');
    if (title.includes('HR')) tags.push('HR');
    if (title.includes('Recruit')) tags.push('Recruitment');
    if (title.includes('Marketing')) tags.push('Marketing');
    if (title.includes('Sales')) tags.push('Sales');
    if (title.includes('Advertising')) tags.push('Advertising');
    return tags.length > 0 ? tags : ['Tech'];
  };

  // Tags grises: Requisitos y detalles
  const inferDescriptionTags = (title, modality, experienceLevel) => {
    const tags = [];
    if (modality.includes('Remote')) tags.push('Remote Work');
    if (modality.includes('Hybrid')) tags.push('Hybrid Work');
    if (modality.includes('On-site')) tags.push('On-site Work');
    if (experienceLevel === 'Junior') tags.push('Entry Level');
    if (experienceLevel === 'Senior') tags.push('Experienced');
    if (title.includes('Travel') || modality.includes('Travel')) tags.push('Need to Travel');
    if (title.includes('No shift') || modality.includes('No shift')) tags.push('No Shift Work Required');
    if (title.includes('Enterprise') || modality.includes('Enterprise')) tags.push('Enterprise (Party A)');
    return tags.length > 0 ? tags : ['Flexible Schedule'];
  };

  // Generar URL del logo de la empresa usando Clearbit
  const companyDomain = company.toLowerCase().replace(/\s+/g, '') + '.com';
  const companyLogoUrl = `https://logo.clearbit.com/${companyDomain}?size=80`;

  // Generar URL del sitio principal de la empresa
  const companyWebsite = `https://${companyDomain}`;

  // URL del logo de GetOnBoard (estática, proporcionada)
  const getOnBoardLogoUrl = 'https://d2dgum4gsvdsrq.cloudfront.net/assets/icon-new-c18debbaa69bac8df6158426f4a00752b32a7fba603cba4eeb3e4572466344a6.png';

  return (
    <Card>
      {isNewOffer(minutesSincePublished) && <NewBadge>NEW!</NewBadge>}
      <TopSection>
        <div>
          <JobTitle
            href={formattedPublicUrl}
            onClick={handleLinkClick}
            target="_blank"
            rel="noopener noreferrer"
          >
            {title !== 'N/A' ? title : 'Título no disponible'}
          </JobTitle>
          {salary && <Salary>{salary}</Salary>}
        </div>
        {company !== 'N/A' && (
          <CompanyContainer>
            <CompanyLogo
              src={companyLogoUrl}
              alt={`${company} logo`}
              isLoaded={companyLogoLoaded}
              onLoad={() => setCompanyLogoLoaded(true)}
              onError={() => setCompanyLogoLoaded(false)}
            />
            <CompanyName>{company}</CompanyName>
          </CompanyContainer>
        )}
      </TopSection>
      <BottomSection>
        <div>
          {modality !== 'N/A' && (
            <WorkDetails>
              <span>
                <FaClock /> Full-time
              </span>
              <span>
                <FaGlobe /> {modality}
              </span>
            </WorkDetails>
          )}
          {location !== 'N/A' && (
            <Location>
              <FaMapMarkerAlt /> {location}
            </Location>
          )}
          {experienceLevel !== 'N/A' && <Seniority>{experienceLevel}</Seniority>}
          <Tags>
            {inferCategoryTags(title).map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </Tags>
          <JobDescription>
            {(descriptionTags.length > 0 ? descriptionTags : inferDescriptionTags(title, modality, experienceLevel)).map((tag, index) => (
              <DescriptionTag key={index}>{tag}</DescriptionTag>
            ))}
          </JobDescription>
          {isPublishedToday(published) ? (
            <PublishedToday>
              {formatTimeSincePublished(minutesSincePublished)}
            </PublishedToday>
          ) : (
            <MetaInfo>Publicado: {formatDateTime(published)}</MetaInfo>
          )}
          <PortalInfo>
            <PortalLogo
              src={getOnBoardLogoUrl}
              alt="GetOnBoard logo"
              isLoaded={portalLogoLoaded}
              onLoad={() => setPortalLogoLoaded(true)}
              onError={() => setPortalLogoLoaded(false)}
            />
            <span>{portal}</span>
          </PortalInfo>
        </div>
        <Actions>
          <SaveButton onClick={onSave}>
            <FaBookmark /> Guardar
          </SaveButton>
          <InterestedButton onClick={onInterested}>
            <FaHeart /> Interesado ({randomClicks})
          </InterestedButton>
          <ShareButton onClick={onShare} aria-label="Share job">
            <FaShareAlt /> Share
          </ShareButton>
          <LinkButton
            href={formattedPublicUrl}
            onClick={handleLinkClick}
            target="_blank"
            rel="noopener noreferrer"
          >
            Link to
          </LinkButton>
        </Actions>
        {company !== 'N/A' && (
          <FooterSection>
            <FaBuilding />
            <CompanyLink href={companyWebsite} target="_blank" rel="noopener noreferrer">
              Visitar {company}
            </CompanyLink>
          </FooterSection>
        )}
      </BottomSection>
    </Card>
  );
};

export default JobCard;