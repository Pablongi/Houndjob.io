// /frontend/src/components/filters/FilterContext.tsx
import { FilterState } from '@/types/filter';
import { Job } from '@/types/job';
import { supabase } from '@/supabase';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTagsHierarchy } from '@/hooks/useTags';

interface AppContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  strictMode: boolean;
  setStrictMode: React.Dispatch<React.SetStateAction<boolean>>;
  user: Session['user'] | null;
  setUser: React.Dispatch<React.SetStateAction<Session['user'] | null>>;
  categoriesData: any[];
  catToSubs: Map<string, Set<string>>;
  subToTags: Map<string, Set<string>>;
}

const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const savedFilters = localStorage.getItem('filters');
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        return {
          ...parsed,
          selectedCategories: Array.isArray(parsed.selectedCategories) ? new Set<string>(parsed.selectedCategories) : new Set<string>(),
          selectedSubcategories: Array.isArray(parsed.selectedSubcategories) ? new Set<string>(parsed.selectedSubcategories) : new Set<string>(),
          selectedTags: Array.isArray(parsed.selectedTags) ? new Set<string>(parsed.selectedTags) : new Set<string>(),
          selectedPortals: Array.isArray(parsed.selectedPortals) ? new Set<string>(parsed.selectedPortals) : new Set<string>(),
          selectedCountries: Array.isArray(parsed.selectedCountries) ? new Set<string>(parsed.selectedCountries) : new Set<string>(),
          selectedRegions: Array.isArray(parsed.selectedRegions) ? new Set<string>(parsed.selectedRegions) : new Set<string>(),
          selectedJobTitles: Array.isArray(parsed.selectedJobTitles) ? new Set<string>(parsed.selectedJobTitles) : new Set<string>(),
          selectedModalities: Array.isArray(parsed.selectedModalities) ? new Set<string>(parsed.selectedModalities) : new Set<string>(),
          selectedExperiences: Array.isArray(parsed.selectedExperiences) ? new Set<string>(parsed.selectedExperiences) : new Set<string>(),
          selectedSalary: Array.isArray(parsed.selectedSalary) ? new Set<string>(parsed.selectedSalary) : new Set<string>(),   // ←←← AGREGADO
        };
      }
    } catch (e) {
      console.warn('Invalid filters in localStorage, resetting.');
      localStorage.removeItem('filters');
    }

    return {
      search: '',
      selectedCategories: new Set<string>(),
      selectedSubcategories: new Set<string>(),
      selectedTags: new Set<string>(),
      selectedPortals: new Set<string>(),
      selectedCountries: new Set<string>(),
      selectedRegions: new Set<string>(),
      company: '',
      selectedJobTitles: new Set<string>(),
      selectedModalities: new Set<string>(),
      selectedExperiences: new Set<string>(),
      selectedSalary: new Set<string>(),           // ←←← AGREGADO
    };
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [strictMode, setStrictMode] = useState(() => {
    try {
      const savedStrict = localStorage.getItem('strictMode');
      return savedStrict ? JSON.parse(savedStrict) : false;
    } catch (e) {
      return false;
    }
  });
  const [user, setUser] = useState<Session['user'] | null>(null);

  const { data: categoriesData = [] } = useTagsHierarchy();

  const catToSubs = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    categoriesData.forEach((cat: any) => {
      const subs = new Set<string>(cat.subcategories?.map((s: any) => s.name) || []);
      map.set(cat.name, subs);
    });
    return map;
  }, [categoriesData]);

  const subToTags = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    categoriesData.forEach((cat: any) => {
      cat.subcategories?.forEach((sub: any) => {
        const tags = new Set<string>(sub.tags?.map((t: any) => t.name) || []);
        map.set(sub.name, tags);
      });
    });
    return map;
  }, [categoriesData]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const serializableFilters = {
        ...filters,
        selectedCategories: Array.from(filters.selectedCategories),
        selectedSubcategories: Array.from(filters.selectedSubcategories),
        selectedTags: Array.from(filters.selectedTags),
        selectedPortals: Array.from(filters.selectedPortals),
        selectedCountries: Array.from(filters.selectedCountries),
        selectedRegions: Array.from(filters.selectedRegions),
        selectedJobTitles: Array.from(filters.selectedJobTitles),
        selectedModalities: Array.from(filters.selectedModalities),
        selectedExperiences: Array.from(filters.selectedExperiences),
        selectedSalary: Array.from(filters.selectedSalary),     // ←←← AGREGADO
      };
      localStorage.setItem('filters', JSON.stringify(serializableFilters));
      localStorage.setItem('strictMode', JSON.stringify(strictMode));
    } catch (e) {
      console.warn('Failed to save filters to localStorage:', e);
    }
  }, [filters, strictMode]);

  return (
    <AppContext.Provider value={{
      filters,
      setFilters,
      jobs,
      setJobs,
      strictMode,
      setStrictMode,
      user,
      setUser,
      categoriesData,
      catToSubs,
      subToTags
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

export { AppProvider, useAppContext };