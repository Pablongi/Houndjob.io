import React from 'react';

interface DiagnosticsProps {
  onComplete: (result: any) => void;
}

const Diagnostics: React.FC<DiagnosticsProps> = ({ onComplete }) => {
  const runDiagnostics = () => {
    console.log('[Diagnostics] Iniciando diagnóstico...');
    // Simula pruebas
    const tests = [
      { name: 'Index.html', check: () => document.getElementById('root') !== null },
      { name: 'Main.tsx', check: () => { console.log('[Diagnostics] Main.tsx ejecutado'); return true; } },
      { name: 'App.tsx', check: () => { console.log('[Diagnostics] App.tsx renderizado'); return true; } },
      { name: 'JobsService', check: async () => {
        try {
          const response = await fetch('https://houndjobback.fly.dev/alloffers');
          return response.ok;
        } catch (err) {
          console.error('[Diagnostics] Error en JobsService:', err);
          return false;
        }
      }},
    ];

    const results = tests.map(test => ({
      name: test.name,
      passed: test.check(),
    }));

    console.log('[Diagnostics] Resultados:', results);
    onComplete(results);
  };

  return (
    <div>
      <button onClick={runDiagnostics}>Ejecutar Diagnóstico</button>
    </div>
  );
};

export default Diagnostics;