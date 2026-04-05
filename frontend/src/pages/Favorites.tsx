// /frontend/src/pages/Favorites.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import JobCard from '@/components/jobs/JobCard';
import { Job } from '@/types/job';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          job_offers (
            id,
            title,
            company,
            city,
            region,
            comuna,
            description,
            experience,
            salary,
            date_posted,
            link,
            company_logo,
            source,
            modality,
            views,
            scraped_at
          )
        `)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error al cargar favoritos:', error);
        setLoading(false);
        return;
      }

      // ←←← MAPEO CORRECTO a la estructura Job que espera JobCard
      const mappedJobs: Job[] = (data || []).map((fav: any) => {
        const j = fav.job_offers;
        return {
          id: j.id,
          description: j.description || '',
          attributes: {
            title: j.title || 'Sin título',
            company: j.company || 'Sin empresa',
            country: 'Chile',
            portal: j.source || '',
            creation_date: j.scraped_at || '',
            logo_url: j.company_logo || '',
            region: j.region || null,
            city: j.city || null,
            salary: j.salary || 'Sin salario',
            experience: j.experience || 'Sin experiencia',
            modality: j.modality || null,
            publicUrl: j.link || '#',
            date_posted: j.date_posted || '',
            views: j.views || 0,
          },
          publicUrl: j.link || '#',
          tags: [],           // no se usan en la card
          views: j.views || 0,
        };
      });

      setFavorites(mappedJobs);
      setLoading(false);
    };

    loadFavorites();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando favoritos...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">❤️ Mis Favoritos ({favorites.length})</h1>
      {favorites.length === 0 ? (
        <p className="text-center text-gray-500">Aún no tienes empleos guardados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
};

export default Favorites;