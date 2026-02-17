import { FilterState } from '@/types/filter';
import { Job } from '@/types/job';
import { supabase } from '@/supabase';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  strictMode: boolean;
  setStrictMode: React.Dispatch<React.SetStateAction<boolean>>;
  user: Session['user'] | null;
  setUser: React.Dispatch<React.SetStateAction<Session['user'] | null>>;
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
          selectedCategories: Array.isArray(parsed.selectedCategories) ? new Set(parsed.selectedCategories) : new Set(),
          selectedSubcategories: Array.isArray(parsed.selectedSubcategories) ? new Set(parsed.selectedSubcategories) : new Set(),
          selectedTags: Array.isArray(parsed.selectedTags) ? new Set(parsed.selectedTags) : new Set(),
          selectedPortals: Array.isArray(parsed.selectedPortals) ? new Set(parsed.selectedPortals) : new Set(),
          selectedCountries: Array.isArray(parsed.selectedCountries) ? new Set(parsed.selectedCountries) : new Set(),
          selectedRegions: Array.isArray(parsed.selectedRegions) ? new Set(parsed.selectedRegions) : new Set(),
          selectedJobTitles: Array.isArray(parsed.selectedJobTitles) ? new Set(parsed.selectedJobTitles) : new Set(),
          selectedModalities: Array.isArray(parsed.selectedModalities) ? new Set(parsed.selectedModalities) : new Set(),
          selectedExperiences: Array.isArray(parsed.selectedExperiences) ? new Set(parsed.selectedExperiences) : new Set(),
        };
      }
    } catch (e) {
      console.warn('Invalid filters in localStorage, resetting.');
      localStorage.removeItem('filters');
    }
    return {
      search: '',
      selectedCategories: new Set(),
      selectedSubcategories: new Set(),
      selectedTags: new Set(),
      selectedPortals: new Set(),
      selectedCountries: new Set(),
      selectedRegions: new Set(),
      company: '',
      selectedJobTitles: new Set(),
      selectedModalities: new Set(),
      selectedExperiences: new Set(),
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
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
      };
      localStorage.setItem('filters', JSON.stringify(serializableFilters));
      localStorage.setItem('strictMode', JSON.stringify(strictMode));
    } catch (e) {
      console.warn('Failed to save filters to localStorage:', e);
    }
  }, [filters, strictMode]);

  return (
    <AppContext.Provider value={{ filters, setFilters, jobs, setJobs, strictMode, setStrictMode, user, setUser }}>
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