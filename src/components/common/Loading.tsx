import React from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  width: 100%;
`;

const LogoSpin = styled.img`
  width: 64px;
  height: 64px;
  animation: spin 2s linear infinite;
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Loading: React.FC = () => (
  <LoadingContainer>
    <LogoSpin src="/logos/Houndjob_logo.png" alt="Cargando HoundJob" />
  </LoadingContainer>
);

export default Loading;