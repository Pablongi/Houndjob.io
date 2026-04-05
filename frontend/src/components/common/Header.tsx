// /frontend/src/components/common/Header.tsx
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useState } from 'react';
import { supabase } from '@/supabase';
import { useAppContext } from '@/components/filters/FilterContext';
import { logger } from '@/utils/logger';

const HeaderContainer = styled.header`
  background: var(--header-gradient);
  color: var(--text);
  box-shadow: var(--shadow);
  padding: 8px 16px;
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
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
  &:hover { text-decoration: underline; }
`;

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useAppContext();

  logger.info('📌 Header renderizado');

  const handleDevLogin = () => {
    logger.actionStart('Login DEV');
    const fakeUser = {
      id: 'dev-user-123',
      email: 'dev@houndjob.cl',
      user_metadata: { full_name: 'Usuario Desarrollo' }
    } as any;
    setUser(fakeUser);
    logger.actionEnd('Login DEV', true);
    alert('✅ Modo desarrollo: Login simulado activado');
  };

  const handleLogin = async () => {
    logger.actionStart('Login con Google');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:3000/auth/callback' },
    });
    if (error) {
      logger.actionEnd('Login con Google', false, error.message);
      alert('Error Google: ' + error.message);
    } else {
      logger.actionEnd('Login con Google', true);
    }
  };

  const handleLogout = async () => {
    logger.actionStart('Logout');
    await supabase.auth.signOut();
    setUser(null);
    logger.actionEnd('Logout', true);
    window.location.reload();
  };

  return (
    <HeaderContainer>
      <LogoSection>
        <NavLink to="/">
          <LogoImg 
            src="/hound/HoundJob LOGO.png" 
            alt="HoundJob" 
          />
        </NavLink>
        <Slogan>Encuentra tu empleo ideal en segundos</Slogan>
      </LogoSection>

      <NavMenu open={menuOpen}>
        <NavButton>Perfil</NavButton>
        <NavButton>Favoritos</NavButton>
        
        {!user && (
          <NavButton onClick={handleDevLogin} style={{ color: '#f59e0b' }}>
            👷 Login DEV
          </NavButton>
        )}

        <NavButton onClick={user ? handleLogout : handleLogin}>
          {user ? `Logout (${user.email})` : 'Login Google'}
        </NavButton>
      </NavMenu>
    </HeaderContainer>
  );
};

export default Header;