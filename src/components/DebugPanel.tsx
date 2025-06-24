import React, { useEffect } from 'react';
import { Job } from '../types/job'; // Corregida la ruta de importación

interface DebugPanelProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ jobs, loading, error }) => {
  useEffect(() => {
    console.log('[DebugPanel Diagnostic] Estado actual:');
    console.log('- Loading:', loading);
    console.log('- Error:', error || 'Ninguno');
    console.log('- Jobs cargados:', jobs.length);
  }, [jobs, loading, error]);

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, background: '#fff', padding: '10px', border: '1px solid #000' }}>
      <h3>Depuración</h3>
      <p>Loading: {loading ? 'Sí' : 'No'}</p>
      <p>Error: {error || 'Ninguno'}</p>
      <p>Jobs: {jobs.length}</p>
    </div>
  );
};

export default DebugPanel;