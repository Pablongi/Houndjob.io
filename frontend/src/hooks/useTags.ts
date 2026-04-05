// /frontend/src/hooks/useTags.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/supabase';

export const useTagsHierarchy = () => {
  return useQuery({
    queryKey: ['tagsHierarchy'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          subcategories (
            id,
            name,
            tags (id, name)
          )
        `)
        .order('name');

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24,
  });
};