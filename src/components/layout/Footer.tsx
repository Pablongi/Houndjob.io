import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FooterStyled = styled.footer`
  background: linear-gradient(180deg, #f8f8f8, #e8ecef);
  padding: 10px 0;
  border-top: 1px solid var(--zhipin-border);
  text-align: center;
  font-size: 0.9em;
  width: 100%;
  margin: 0;
  @media (max-width: 768px) {
    font-size: 0.8em;
    padding: 8px 0;
  }
`;

const FooterLink = styled(motion.a)`
  color: var(--zhipin-teal);
  margin: 0 10px;
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
    background: var(--zhipin-teal);
    transition: width 0.3s ease;
  }
  @media (max-width: 768px) {
    margin: 0 5px;
  }
`;

const Footer: React.FC = () => (
  <FooterStyled>
    © 2025 Hound | <FooterLink href="#terms">Términos</FooterLink> | <FooterLink href="#privacy">Privacidad</FooterLink> | <FooterLink href="#contact">Contáctanos</FooterLink>
  </FooterStyled>
);

export default Footer;