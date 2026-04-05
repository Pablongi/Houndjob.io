// /frontend/src/utils/logger.ts
const isDev = import.meta.env.DEV;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const formatTime = () => new Date().toLocaleTimeString('es-CL', { hour12: false });

const prefix = (emoji: string, color: keyof typeof colors) =>
  isDev ? `${colors[color]}${emoji} [${formatTime()}]${colors.reset} ` : '';

export const logger = {
  info: (msg: any, ...args: any[]) => console.info(prefix('ℹ️', 'cyan') + msg, ...args),
  success: (msg: any, ...args: any[]) => console.log(prefix('✅', 'green') + msg, ...args),
  warn: (msg: any, ...args: any[]) => console.warn(prefix('⚠️', 'yellow') + msg, ...args),
  error: (msg: any, ...args: any[]) => console.error(prefix('❌', 'red') + msg, ...args),
  debug: (msg: any, ...args: any[]) => { if (isDev) console.debug(prefix('🐛', 'magenta') + msg, ...args); },

  actionStart: (action: string) => {
    console.groupCollapsed(prefix('🚀', 'blue') + `INICIANDO: ${action}`);
  },

  actionEnd: (action: string, success: boolean, details?: any) => {
    if (success) {
      console.log(prefix('✅', 'green') + `${action} → ÉXITO`, details || '');
    } else {
      console.log(prefix('❌', 'red') + `${action} → FALLÓ`, details || '');
    }
    console.groupEnd();
  },

  // Nuevo método para filtros (lo que más pediste)
  filterApplied: (filterType: string, value: string, beforeCount: number, afterCount: number) => {
    const change = afterCount < beforeCount ? ' (redujo resultados)' : '';
    console.log(
      prefix('🔎', 'cyan') +
      `Filtro aplicado → ${filterType}: "${value}" | ${beforeCount} → ${afterCount} jobs${change}`
    );
  },

  table: (data: any) => { if (isDev) console.table(data); },
};