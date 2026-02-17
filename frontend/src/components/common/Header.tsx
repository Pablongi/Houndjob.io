// src/components/common/Header.tsx
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useState } from 'react';

const HeaderContainer = styled.header`
  background: var(--header-gradient); /* Updated to use gradient */
  color: var(--text);
  box-shadow: var(--shadow);
  padding: 8px 16px;
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px; /* Aumentado para mobile-friendliness */
  @media (max-width: 768px) {
    height: auto;
    padding: 8px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoImg = styled.img`
  height: 32px;
  width: auto;
`;

const Slogan = styled.span`
  font-size: 14px;
  color: var(--text-light);
`;

const NavMenu = styled.nav<{ open: boolean }>`
  display: flex;
  gap: 16px;
  @media (max-width: 768px) {
    display: ${({ open }) => (open ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 48px;
    left: 0;
    width: 100%;
    background: var(--background);
    padding: 16px;
    box-shadow: var(--shadow);
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 14px;
  cursor: pointer;
  padding: 0 8px;
  &:hover {
    text-decoration: underline;
  }
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--primary);
  @media (max-width: 768px) {
    display: block;
  }
`;

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark' | 'system';
  user: any; // Adjust type as needed
  signInWithGoogle: () => void;
  signOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme, user, signInWithGoogle, signOut }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <HeaderContainer role="banner" aria-label="Encabezado de HoundJob">
      <LogoSection>
        <NavLink to="/">
          <LogoImg src="/logos/Houndjob_logo.png" alt="Logo de HoundJob" loading="lazy" />
        </NavLink>
        <Slogan>Encuentra tu empleo ideal en segundos</Slogan>
      </LogoSection>
      <Hamburger onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú móvil">
        ☰
      </Hamburger>
      <NavMenu open={menuOpen} role="navigation" aria-label="Menú principal">
        <NavButton aria-label="Perfil">Perfil</NavButton>
        <NavButton aria-label="Favoritos">Favoritos</NavButton>
        <NavButton onClick={user ? signOut : signInWithGoogle}>{user ? 'Logout' : 'Login Google'}</NavButton>
      </NavMenu>
    </HeaderContainer>
  );
};

export default Header;