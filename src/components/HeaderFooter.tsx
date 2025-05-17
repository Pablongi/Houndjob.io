import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Header = styled.header`
  background: #fff;
  padding: 10px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 40px;
  margin-right: 10px;
  @media (max-width: 768px) {
    height: 30px;
  }
`;

const Slogan = styled.p`
  color: #555;
  margin: 0;
  @media (max-width: 768px) {
    font-size: 0.9em;
  }
`;

const NavButton = styled(motion.button)`
  background: none;
  border: none;
  color: #4CAF50;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  &:hover {
    color: #388E3C;
    transform: scale(1.1);
  }
`;

const Footer = styled.footer`
  background: linear-gradient(180deg, #f8f8f8, #e8ecef);
  padding: 10px 20px;
  border-top: 1px solid #ddd;
  text-align: center;
  font-size: 0.9em;
  @media (max-width: 768px) {
    font-size: 0.8em;
    padding: 8px 15px;
  }
`;

const FooterLink = styled(motion.a)`
  color: #4CAF50;
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
    background: #4CAF50;
    transition: width 0.3s ease;
  }
  @media (max-width: 768px) {
    margin: 0 5px;
  }
`;

interface HeaderFooterProps {
  isFooter?: boolean;
  onReset?: () => void;
}

const HeaderFooter: React.FC<HeaderFooterProps> = ({ isFooter, onReset }) => {
  if (isFooter) {
    return (
      <Footer className="animate__animated animate__slideInUp">
        © 2025 HoundJob | <FooterLink href="#terms">Términos</FooterLink> | <FooterLink href="#privacy">Privacidad</FooterLink> | <FooterLink href="#contact">Contáctanos</FooterLink>
      </Footer>
    );
  }
  return (
    <Header>
      <Logo
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="animate__animated animate__bounceIn"
      >
        <LogoImage
          src="/houndjob-logo.png"
          alt="HoundJob Logo"
          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')}
        />
        <div>
          <div>HoundJob</div>
          <Slogan>¡Todos los empleos en un solo lugar!</Slogan>
        </div>
      </Logo>
      <NavButton
        onClick={onReset}
        whileHover={{ scale: 1.1 }}
        className="animate__animated animate__pulse"
      >
        Home
      </NavButton>
    </Header>
  );
};

export default HeaderFooter;