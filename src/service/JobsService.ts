import axios from 'axios';

const API_URL = 'https://houndjobback.fly.dev/getonboard';
const CACHE_KEY = 'getonbrd_jobs_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

interface Filters {
  [key: string]: string | number;
}

interface ApiResponse {
  data: any[];
}

const JobsService = {
  getJobs: async (filters: Filters = {}, page: number = 1, perPage: number = 40): Promise<ApiResponse> => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
    const now = Date.now();

    if (cachedData && cachedTimestamp && now - parseInt(cachedTimestamp) < CACHE_DURATION) {
      return JSON.parse(cachedData);
    }

    try {
      const queries = [
        'Chile',
        'Santiago',
        'Valparaíso',
        'Concepción',
        'Antofagasta',
        'Viña del Mar',
      ];

      const requests = queries.map((query) =>
        axios
          .get(`${API_URL}?jobs=${query}`)
          .catch((error) => {
            console.error(`Error fetching jobs for query "${query}":`, error.response || error.message);
            return { data: [] }; // Devolver un arreglo vacío si la solicitud falla
          })
      );
      const responses = await Promise.all(requests);

      const allJobs = responses
        .flatMap((response) => (Array.isArray(response.data) ? response.data : []))
        .filter((job, index, self) =>
          index === self.findIndex((j) => j.id === job.id)
        );

      console.log('Total jobs fetched:', allJobs.length);
      console.log('Sample job data:', allJobs[0]); // Mostrar un ejemplo de los datos obtenidos
      const data: ApiResponse = { data: allJobs };

      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(`${CACHE_KEY}_timestamp`, now.toString());

      return data;
    } catch (error: any) {
      console.log('Error completo al obtener trabajos:', error.response || error.message);
      throw new Error(`Error al obtener los trabajos de la API: ${error.message}`);
    }
  },

  getCompanyLogo: async (companyId: string): Promise<string | null> => {
    try {
      const response = await axios.get(`https://houndjobback.fly.dev/companies/${companyId}`);
      return response.data?.data?.attributes?.logo || null;
    } catch (error) {
      console.error(`Error al obtener el logo de la empresa ${companyId}:`, error);
      return null;
    }
  },
};

export default JobsService;