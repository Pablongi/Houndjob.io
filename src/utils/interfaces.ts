import { FilterState, RankedItem } from '../types/filter';
import { Job, Tag } from '../types/job';

export interface SearchBarProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  allTags: Tag[];
  allCategories: RankedItem[];
  allSubcategories: RankedItem[];
  allRegions: string[];
  topCompanies: RankedItem[];
  topTags?: string[];
}

export interface HomeProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  allTags: Tag[];
  allCategories: RankedItem[];
  allSubcategories: RankedItem[];
  allRegions: string[];
  topCompanies: RankedItem[];
  jobs: Job[];
  topTags: string[];
  loadMoreJobs: () => void;
  hasMore: boolean;
}