import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

if (process.env.NODE_ENV !== 'production') {
  console.log('[Main Diagnostic] [STEP 1] Iniciando carga de la aplicación...');
}
const rootElement = document.getElementById('root');
if (!rootElement) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Main Diagnostic] [STOP] ERROR: Elemento #root no encontrado en index.html');
  }
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Main Diagnostic] [STEP 2] Elemento #root encontrado, iniciando renderizado...');
  }
}

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(rootElement!);
if (process.env.NODE_ENV !== 'production') {
  console.log('[Main Diagnostic] [STEP 3] Creando raíz de ReactDOM...');
}

const isDev = process.env.NODE_ENV === 'development';

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);

if (process.env.NODE_ENV !== 'production') {
  console.log('[Main Diagnostic] [STEP 4] Renderizado iniciado.');
}