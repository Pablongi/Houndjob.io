// src/types/Job.ts
export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string; // Nuevo campo para el ID de la empresa
  companyLogo: string | null;
  modality: string;
  remoteStatus: string;
  location: string;
  published: number | null;
  portal: string;
  publicUrl: string;
  category: string;
  tags: string[];
  perks: string[]; // Nuevo campo para los perks
  benefits: string[]; // Nuevo campo para los beneficios
  experienceLevel: string;
  interestedCount: number;
  salary: string;
  description: string; // Nuevo campo para la descripción
  functions: string; // Nuevo campo para las funciones
}