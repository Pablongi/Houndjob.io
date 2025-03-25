// src/service/JobsService.js
import axios from 'axios';

class JobsService {
  async getJobs() {
    const queries = [
      // Categorías prioritarias
      'developer',
      'engineer',
      'senior',
      'lead',
      'analyst',
      'manager',
      'designer',
      'product',
      'data',
      'software',
      'consultant',
      'architect',
      'fullstack',
      'backend',
      'cloud',
      'security',
      // Ubicaciones prioritarias
      'Chile',
      'Santiago',
      'Valparaíso',
      'Concepción',
      'Antofagasta',
      'Viña del Mar',
      // Consulta más general
      'tech', // Agregamos una consulta más general para capturar más trabajos
    ];

    try {
      const requests = queries.map((query) =>
        axios
          .get(`https://houndjobback.fly.dev/getonboard?jobs=${query}`, {
            timeout: 10000, // Aumentamos el timeout a 10 segundos
          })
          .catch((error) => {
            console.error(`Error fetching jobs for query "${query}":`, error.message);
            return { data: [] };
          })
      );
      const responses = await Promise.all(requests);

      // Depuración: cuántos trabajos devuelve cada consulta
      responses.forEach((response, index) => {
        console.log(`Trabajos devueltos por la consulta "${queries[index]}":`, response.data.length);
      });

      const allJobsBeforeDeduplication = responses.flatMap((response) =>
        Array.isArray(response.data) ? response.data : []
      );
      console.log('Total de trabajos antes de eliminar duplicados:', allJobsBeforeDeduplication.length);

      const allJobs = allJobsBeforeDeduplication
        .filter((job, index, self) =>
          index === self.findIndex((j) => j.id === job.id)
        );

      console.log('Total jobs fetched después de eliminar duplicados:', allJobs.length);
      return { data: allJobs };
    } catch (error) {
      console.error('Error fetching jobs with multiple queries:', error.message);
      return { data: [] };
    }
  }
}

export default new JobsService();