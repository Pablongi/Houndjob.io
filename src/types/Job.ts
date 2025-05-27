export interface JobAttributes {
  title: string;
  company: string;
  country: string;
  portal: string;
  creation_date: string;
  logo_url: string;
  region: string | null;
}

export interface Job {
  id: string;
  description: string;
  attributes: JobAttributes;
  publicUrl: string;
  tags: Tag[];
  jobType?: string;
}

export interface Tag {
  categoría: string;
  subcategoría: string;
  tag: string;
  count: number; // Added count property
}