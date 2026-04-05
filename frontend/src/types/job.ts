// /frontend/src/types/job.ts
export interface JobAttributes {
  title: string;
  company: string;
  country: string;
  portal: string;
  creation_date: string;
  logo_url: string;
  region?: string | null;
  city?: string | null;
  salary?: string | null;
  experience?: string | null;
  modality?: string | null;
  publicUrl?: string;
  date_posted?: string;
  views?: number;           // ← NUEVO
}

export interface Job {
  id: string;
  description: string;
  attributes: JobAttributes;
  publicUrl: string;
  tags: Tag[];
  views?: number;           // ← NUEVO (para compatibilidad con datos planos del backend)
}

export interface Tag {
  tag: string;
  count: number;
  categoría?: string;
  subcategoría?: string;
}

export interface Category {
  categoría: string;
  subcategorías: {
    nombre: string;
    tags: string[];
  }[];
}

export interface RankedItem {
  name: string;
  count: number;
  logo?: string;
}