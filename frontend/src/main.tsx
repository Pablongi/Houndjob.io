// /frontend/src/main.tsx
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { supabase } from './supabase';
import { logger } from '@/utils/logger';   // ← IMPORTANTE: esta línea faltaba

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Listener de login (con logger seguro)
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    logger.success('🔥 USUARIO LOGUEADO:', session.user.email);
  } else {
    logger.info('🔥 AUTH EVENT:', event);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

logger.success('[Main] Aplicación cargada correctamente');