import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

console.log('[Main Diagnostic] [STEP 1] Iniciando carga de la aplicación...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[Main Diagnostic] [STOP] ERROR: Elemento #root no encontrado en index.html');
} else {
  console.log('[Main Diagnostic] [STEP 2] Elemento #root encontrado, iniciando renderizado...');
}

const root = ReactDOM.createRoot(rootElement!);
console.log('[Main Diagnostic] [STEP 3] Creando raíz de ReactDOM...');
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

console.log('[Main Diagnostic] [STEP 4] Renderizado iniciado.');
console.log('main.tsx ejecutado');