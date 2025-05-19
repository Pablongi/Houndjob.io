export interface Job {
  id: string;
  title: string;
  company: string;
  portal: string;
  published: number;
  publicUrl: string;
  tags: string[];
  companyLogo?: string;
  rawCreationDate?: string | number; // Added for debugging
}