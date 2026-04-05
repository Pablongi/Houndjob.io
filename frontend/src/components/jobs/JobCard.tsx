// /frontend/src/components/jobs/JobCard.tsx
import { memo, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Job } from '@/types/job';
import { useAppContext } from '@/components/filters/FilterContext';
import { portalToLogo } from '@/constants';
import { supabase } from '@/supabase';
import { logger } from '@/utils/logger';

const Card = styled(motion.div)`
  background: var(--card-gradient);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { box-shadow: var(--card-hover-shadow); }
`;

const TitleLink = styled.a`
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  line-height: 1.3;
  &:hover { color: var(--primary); }
`;

const CompanySection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--primary);
`;

const CompanyLogo = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: contain;
  background: white;
  padding: 2px;
`;

const Location = styled.div`
  font-size: 12px;
  color: var(--text-light);
`;

const Description = styled.p`
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.5;
  max-height: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
`;

const PublishedDate = styled.p`
  font-size: 12px;
  color: var(--text-light);
  font-weight: 500;
`;

const PortalLogo = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
`;

const BottomActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? 'var(--primary)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--text)')};
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'var(--border)')};
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: var(--primary); color: #fff; }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const JobCard = memo(({ job }: { job: Job }) => {
  const { user } = useAppContext();
  const [isSaved, setIsSaved] = useState(false);
  const [views, setViews] = useState<number>(job.attributes.views ?? job.views ?? 0);
  const [expanded, setExpanded] = useState(false);

  const title = job.attributes.title || 'Sin título';
  const company = job.attributes.company || 'Sin empresa';
  const location = job.attributes.region ? `${job.attributes.region}, Chile` : 'Chile';

  // ←←← FIX: Limpiar URL de logo (quitar doble https)
  let companyLogo = job.attributes.logo_url || '/logos/company-default.png';
  if (companyLogo.includes('https:https//')) {
    companyLogo = companyLogo.replace('https:https//', 'https://');
  }

  const link = job.attributes.publicUrl || job.publicUrl || '#';
  const portal = job.attributes.portal || '';
  const portalLogoSrc = portalToLogo[portal] || '/portals/default.svg';

  let postedText = 'Hace poco';
  const dateToUse = job.attributes.date_posted || job.attributes.creation_date;
  if (dateToUse) {
    const daysAgo = Math.floor((Date.now() - new Date(dateToUse).getTime()) / 86400000);
    postedText = daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo} días`;
  }

  const toggleFavorite = async () => {
    if (!user) {
      alert('Para guardar empleos en favoritos debes iniciar sesión con Google');
      return;
    }
    logger.actionStart(`Guardando favorito job ${job.id}`);
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ job_id: job.id }),
    });

    if (res.ok) {
      const data = await res.json();
      setIsSaved(data.status === 'added');
      if (data.status === 'added') setViews(v => v + 1);
      logger.actionEnd(`Guardando favorito job ${job.id}`, true);
    }
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) setViews(v => v + 1);
    logger.actionStart(`Expandiendo card → ${title}`);
  };

  return (
    <Card whileHover={{ y: -4 }} onClick={handleExpand}>
      <TitleLink href={link} target="_blank" rel="noopener noreferrer">
        {title}
      </TitleLink>

      <CompanySection>
        <CompanyLogo src={companyLogo} alt={company} />
        <span>{company}</span>
      </CompanySection>

      <Location>🇨🇱 {location}</Location>

      <PublishedDate>{postedText}</PublishedDate>

      <p className="text-xs text-gray-500">👁 {views} vistas</p>

      <Description>{job.description || 'Sin descripción disponible'}</Description>

      <BottomActions>
        <PortalLogo src={portalLogoSrc} alt={portal} loading="lazy" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <ActionButton onClick={(e) => { e.stopPropagation(); toggleFavorite(); }} $active={isSaved}>
            {isSaved ? '❤️ Guardado' : 'Guardar'}
          </ActionButton>
          <ActionButton onClick={(e) => e.stopPropagation()}>Compartir</ActionButton>
        </div>
      </BottomActions>

      <ExpandButton onClick={(e) => { e.stopPropagation(); handleExpand(); }}>
        {expanded ? '▲ Menos info' : '▼ Más información'}
      </ExpandButton>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-light)' }}>
              {job.description || 'Información adicional no disponible en este momento.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});

export default JobCard;