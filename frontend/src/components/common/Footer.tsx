// /frontend/src/components/common/Footer.tsx
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { logger } from '@/utils/logger';

const FooterStyled = styled.footer`
  background: var(--footer-gradient);
  padding: 16px 0;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 12px;
  width: 100%;
  color: var(--text-light);
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 12px 0;
  }
`;

const FooterLink = styled(motion.a)`
  color: var(--primary);
  margin: 0 8px;
  text-decoration: none;
  position: relative;
  &:hover::after {
    width: 100%;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary);
    transition: width 0.3s ease;
  }
`;

const PortalLogos = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
`;

const PortalLogo = styled.img`
  height: 24px;
  loading: lazy;
`;

const Footer: React.FC = () => {
  logger.info('📌 Footer renderizado');

  const handleLinkClick = (linkName: string) => {
    logger.actionStart(`Clic en enlace del footer: ${linkName}`);
    // Aquí podrías agregar analytics en el futuro
    logger.actionEnd(`Clic en enlace del footer: ${linkName}`, true);
  };

  return (
    <FooterStyled role="contentinfo" aria-label="Pie de página de HoundJob">
      © 2025 HoundJob | 
      <FooterLink 
        href="#terms" 
        aria-label="Términos de uso"
        onClick={() => handleLinkClick('Términos')}
      >
        Términos
      </FooterLink> | 
      <FooterLink 
        href="#privacy" 
        aria-label="Política de privacidad"
        onClick={() => handleLinkClick('Privacidad')}
      >
        Privacidad
      </FooterLink> | 
      <FooterLink 
        href="#contact" 
        aria-label="Contáctanos"
        onClick={() => handleLinkClick('Contáctanos')}
      >
        Contáctanos
      </FooterLink>
      <PortalLogos>
        <PortalLogo src="/portals/Portal-BNE_logo.png" alt="Icono del portal BNE" />
        <PortalLogo src="/portals/getonboard.png" alt="Icono del portal Get on Board" />
        <PortalLogo src="/portals/Trabajoconsentido_logo.png" alt="Icono del portal Trabajo con Sentido" />
      </PortalLogos>
    </FooterStyled>
  );
};

export default Footer;