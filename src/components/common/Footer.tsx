import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FooterStyled = styled.footer`
  background: linear-gradient(180deg, var(--background-secondary, #f8f8f8), var(--chip-bg, #e8ecef));
  padding: 5px 0;
  border-top: 1px solid var(--border, #e8ecef);
  text-align: center;
  font-size: 0.8em;
  width: 100%;
  margin: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3vh;
  z-index: 1000;
  color: var(--text-light, #666);
  @media (max-width: 768px) {
    font-size: 0.7em;
    padding: 4px 0;
  }
`;

const FooterLink = styled(motion.a)`
  color: var(--zhipin-teal);
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
    background: var(--zhipin-teal);
    transition: width 0.3s ease;
  }
  @media (max-width: 768px) {
    margin: 0 4px;
  }
`;

const Footer: React.FC = () => (
  <FooterStyled role="contentinfo">
    © 2025 Hound | <FooterLink href="#terms">Términos</FooterLink> | <FooterLink href="#privacy">Privacidad</FooterLink> | <FooterLink href="#contact">Contáctanos</FooterLink>
  </FooterStyled>
);

export default Footer;