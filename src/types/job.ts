export interface JobAttributes {
  title: string;
  company: string;
  country: string;
  portal: string;
  creation_date: string;
  logo_url: string;
  region?: string | null;
  jobType?: string | null;
  salary?: number | null;
  minSalary?: string | null;
  maxSalary?: string | null;
  category?: string | null;
}

export interface Tag {
  tag: string;
  count: number;
  categoría?: string;
  subcategoría?: string;
}

export interface RankedItem {
  name: string;
  count: number;
  logo?: string;
}

export interface Job {
  id: string;
  description: string;
  attributes: JobAttributes;
  publicUrl?: string;
  tags: Tag[];
}

export interface Category {
  categoría: string;
  subcategorías: {
    nombre: string;
    tags: string[];
  }[];
}